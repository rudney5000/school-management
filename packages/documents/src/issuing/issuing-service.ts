import { randomUUID } from 'node:crypto';
import { getDocumentType } from '../document-types';
import type { DocumentTypeDefinition, DocumentTypeKey } from '../document-types/define';
import type { PdfRenderer } from '../engine/render';
import { DocumentError } from '../errors';
import type {
  Actor,
  AssetStore,
  Collector,
  FileStore,
  IssuedDocument,
  IssuedDocumentStore,
  IssuedFilter,
  IssuingTx,
  Locale,
  PolicyStep,
} from '../ports';
import type { PolicyService } from '../policies/policy-service';
import type { PolicyRunner } from '../policies/runtime';
import { canAccess, loadLayoutAssets, type TemplateService } from '../templates/template-service';
import { sha256 } from './hash';
import { checkFieldValues } from './fields';

export interface IssueInput {
  type: DocumentTypeKey;
  scope: {
    schoolId: string;
    subSchoolId: string;
    /** Short code of the sub-school, first part of every number: SJG-BUL-… */
    subSchoolCode: string;
  };
  params: unknown;
  actor: Actor;
  locale?: Locale;
  /** Correction: the old document is revoked in the same transaction, with this reason. */
  replaces?: { id: string; reason: string };
  /**
   * The template to use. Required for types with several templates per
   * school (free documents); ignored otherwise, the scope's template is used.
   */
  templateId?: string;
  /** Values of the template's fields, by key. */
  fields?: Record<string, unknown>;
}

/** What anyone holding the QR code may see. No grades, no amounts. */
export interface PublicVerification {
  id: string;
  documentType: DocumentTypeKey;
  number: string;
  schoolName: string;
  /** "M*** K*** M***": enough to match the paper, not enough to identify a stranger. */
  holderName: string | null;
  issuedAt: string;
  status: IssuedDocument['status'];
  revokedAt: string | null;
  replacedBy: string | null;
}

export interface IssuingServiceDeps<Tx extends IssuingTx = IssuingTx> {
  templates: TemplateService;
  policies: PolicyService;
  runner: PolicyRunner<Tx>;
  issued: IssuedDocumentStore<Tx>;
  files: FileStore;
  assets: AssetStore;
  collectors: Partial<Record<DocumentTypeKey, Collector>>;
  renderer: PdfRenderer;
  verifyBaseUrl: string;
  now: () => Date;
  timeZone: string;
}

export const maskName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]!.toUpperCase()}***`)
    .join(' ');

export class IssuingService<Tx extends IssuingTx = IssuingTx> {
  constructor(private readonly deps: IssuingServiceDeps<Tx>) {}

  /** The calendar day in the school's time zone: 23:30 UTC is already tomorrow in Kinshasa. */
  private localDate(at: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.deps.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(at);
  }

  private numberPeriod(type: DocumentTypeDefinition, payload: unknown, issuedAt: string): string {
    if (type.numbering?.period === 'schoolYear') return type.schoolYearOf!(payload);
    return issuedAt.slice(0, 4);
  }

  /**
   * Issues a document: template, data, policy checks, number, hash, PDF
   * stored, row and after… actions inserted. Everything after the checks
   * runs in one transaction: a refusal or a failure takes no number and
   * leaves no action behind.
   */
  async issue(input: IssueInput): Promise<IssuedDocument> {
    const { scope, actor } = input;
    if (!canAccess(actor, scope.schoolId)) throw new DocumentError('NOT_FOUND', 'School not found');
    const type = getDocumentType(input.type);
    const collector = this.deps.collectors[input.type];
    if (!collector) throw new DocumentError('NO_COLLECTOR', `No collector for ${input.type}`);

    const params = type.params.safeParse(input.params);
    if (!params.success) {
      throw new DocumentError(
        'INVALID_PARAMS',
        `Invalid ${input.type} parameters`,
        params.error.issues.map((i) => ({
          code: 'INVALID_PARAMS' as const,
          path: i.path.join('.'),
          message: i.message,
        })),
      );
    }

    let resolved;
    if (type.oneTemplatePerScope) {
      resolved = await this.deps.templates.resolve(scope, input.type);
    } else {
      if (!input.templateId) {
        throw new DocumentError('INVALID_PARAMS', `Choose the ${input.type} template to use`);
      }
      resolved = await this.deps.templates.resolveChosen(scope, input.type, input.templateId);
    }
    const { template, version } = resolved;
    const fields = checkFieldValues(version.layout, input.fields ?? {});

    const collected = await collector.collect(params.data, {
      schoolId: scope.schoolId,
      subSchoolId: scope.subSchoolId,
      locale: input.locale ?? 'fr',
    });
    // Field values are typed by the person issuing, not read by the collector.
    const payload = type.payload.safeParse(
      fields === null ? collected : { ...(collected as object), fields },
    );
    if (!payload.success) {
      throw new DocumentError(
        'INVALID_PAYLOAD',
        `The ${input.type} data is incomplete or wrong`,
        payload.error.issues.map((i) => ({
          code: 'INVALID_PAYLOAD' as const,
          path: i.path.join('.'),
          message: i.message,
        })),
      );
    }

    const assets = await loadLayoutAssets(this.deps.assets, template.schoolId, version.layout);
    const policy = await this.deps.policies.resolve(scope, input.type);
    const steps: PolicyStep[] = policy?.version.steps ?? [];
    const id = randomUUID();
    const verifyUrl = `${this.deps.verifyBaseUrl}/verify/${id}`;
    const subjectId = this.subjectId(type, params.data);
    const subject = type.subject && subjectId ? { type: type.subject, id: subjectId } : null;

    return this.deps.issued.transaction(async (tx) => {
      const at = this.deps.now();
      const issuedAt = this.localDate(at);
      if (subject) {
        await tx.lockSubject(`${scope.schoolId}:${input.type}:${subject.type}:${subject.id}`);
      }
      const checkContext = {
        tx,
        actor,
        documentType: input.type,
        schoolId: scope.schoolId,
        subSchoolId: scope.subSchoolId,
        subject,
        today: issuedAt,
        now: at,
      };

      let old: IssuedDocument | null = null;
      if (input.replaces) {
        old = await this.deps.issued.findById(input.replaces.id);
        if (!old || old.subSchoolId !== scope.subSchoolId || old.documentType !== input.type) {
          throw new DocumentError('NOT_FOUND', `Document ${input.replaces.id} not found`);
        }
        if (old.status === 'revoked') throw new DocumentError('CONFLICT', 'Already revoked');
        await this.deps.runner.check(steps, 'beforeRevoke', {
          ...checkContext,
          params: null,
          payload: null,
          document: old,
          replacesId: null,
        });
      }
      await this.deps.runner.check(steps, 'beforeIssue', {
        ...checkContext,
        params: params.data,
        payload: payload.data,
        document: null,
        replacesId: old?.id ?? null,
      });
      if (old) await tx.revoke(old.id, input.replaces!.reason, at);

      let number: string = id;
      if (type.numbering) {
        const period = this.numberPeriod(type, payload.data, issuedAt);
        const counter = await tx.nextNumber(scope.subSchoolId, input.type, period);
        number = [
          scope.subSchoolCode,
          type.numbering.prefix,
          period,
          String(counter).padStart(6, '0'),
        ].join('-');
      }

      const contentHash = sha256({
        documentType: input.type,
        number,
        templateId: template.id,
        templateVersion: version.version,
        payloadVersion: type.payloadVersion,
        payload: payload.data,
        issuedAt,
      });

      const pdf = await this.deps.renderer({
        type,
        layout: version.layout,
        payload: payload.data,
        document: { number, issuedAt, verifyUrl },
        assets,
      });
      const pdfKey = `documents/${scope.schoolId}/${scope.subSchoolId}/${input.type}/${id}.pdf`;
      // If the commit fails after this, the file stays orphaned: harmless, a cleanup job can remove it.
      await this.deps.files.put(pdfKey, pdf, 'application/pdf');

      const doc: IssuedDocument = {
        id,
        schoolId: scope.schoolId,
        subSchoolId: scope.subSchoolId,
        documentType: input.type,
        number,
        subjectType: type.subject,
        subjectId,
        templateId: template.id,
        templateVersion: version.version,
        payload: payload.data,
        payloadVersion: type.payloadVersion,
        contentHash,
        pdfKey,
        status: 'issued',
        revokedAt: null,
        revokedReason: null,
        replacesId: input.replaces?.id ?? null,
        policyId: policy?.policy.id ?? null,
        policyVersion: policy?.version.version ?? null,
        issuedBy: actor.userId,
        issuedAt: at,
      };
      await tx.insert(doc);
      await tx.enqueue([
        ...(old ? this.deps.runner.actions(steps, 'afterRevoke', old, at) : []),
        ...this.deps.runner.actions(steps, 'afterIssue', doc, at),
      ]);
      return doc;
    });
  }

  /** The id of what the document is about: the student of a bulletin, the payment of a receipt… */
  private subjectId(type: DocumentTypeDefinition, params: Record<string, unknown>): string | null {
    if (type.subject === null) return null;
    const key = `${type.subject}Id`;
    const value = params[key];
    if (typeof value !== 'string') {
      throw new Error(`${type.key}: params must contain ${key}, the subject of the document`);
    }
    return value;
  }

  private async get(actor: Actor, id: string): Promise<IssuedDocument> {
    const doc = await this.deps.issued.findById(id);
    if (!doc || !canAccess(actor, doc.schoolId)) {
      throw new DocumentError('NOT_FOUND', `Document ${id} not found`);
    }
    return doc;
  }

  async find(actor: Actor, id: string): Promise<IssuedDocument> {
    return this.get(actor, id);
  }

  async list(actor: Actor, schoolId: string, filter: IssuedFilter): Promise<IssuedDocument[]> {
    if (!canAccess(actor, schoolId)) return [];
    return this.deps.issued.list({ ...filter, schoolId });
  }

  /** The stored PDF, byte for byte: an issued document is never rendered again. */
  async download(actor: Actor, id: string): Promise<{ document: IssuedDocument; pdf: Uint8Array }> {
    const document = await this.get(actor, id);
    return { document, pdf: await this.deps.files.get(document.pdfKey) };
  }

  /**
   * The document stays stored for history; the verification page shows it as
   * revoked. The policy in force today applies, not the one of the issue.
   */
  async revoke(actor: Actor, id: string, reason: string): Promise<IssuedDocument> {
    if (!reason.trim()) throw new DocumentError('INVALID_PARAMS', 'A reason is required');
    const doc = await this.get(actor, id);
    if (doc.status === 'revoked') throw new DocumentError('CONFLICT', 'Already revoked');
    const policy = await this.deps.policies.resolve(doc, doc.documentType);
    const steps = policy?.version.steps ?? [];
    const at = this.deps.now();
    await this.deps.issued.transaction(async (tx) => {
      await this.deps.runner.check(steps, 'beforeRevoke', {
        tx,
        actor,
        documentType: doc.documentType,
        schoolId: doc.schoolId,
        subSchoolId: doc.subSchoolId,
        subject:
          doc.subjectType && doc.subjectId ? { type: doc.subjectType, id: doc.subjectId } : null,
        params: null,
        payload: null,
        document: doc,
        replacesId: null,
        today: this.localDate(at),
        now: at,
      });
      await tx.revoke(id, reason, at);
      await tx.enqueue(this.deps.runner.actions(steps, 'afterRevoke', doc, at));
    });
    return { ...doc, status: 'revoked', revokedAt: at, revokedReason: reason };
  }

  /** Public: what /verify/:id shows. */
  async verify(id: string): Promise<PublicVerification> {
    const doc = await this.deps.issued.findById(id);
    if (!doc) throw new DocumentError('NOT_FOUND', `Document ${id} not found`);
    const type = getDocumentType(doc.documentType);
    const view = type.publicView(doc.payload);
    const [replacement] =
      doc.status === 'revoked' ? await this.deps.issued.list({ replacesId: doc.id }) : [];
    return {
      id: doc.id,
      documentType: doc.documentType,
      number: doc.number,
      schoolName: view.schoolName,
      holderName: view.holderName ? maskName(view.holderName) : null,
      issuedAt: this.localDate(doc.issuedAt),
      status: doc.status,
      revokedAt: doc.revokedAt ? this.localDate(doc.revokedAt) : null,
      replacedBy: replacement?.number ?? null,
    };
  }
}
