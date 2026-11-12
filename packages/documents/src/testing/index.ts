import { randomUUID } from 'node:crypto';
import type { DocumentTypeKey } from '../document-types/define';
import type { LayoutInput } from '../engine/layout';
import { DocumentError } from '../errors';
import type { AssetFile } from '../blocks/context';
import type {
  AssetStore,
  DocumentTemplate,
  FileStore,
  IssuedDocument,
  IssuedDocumentStore,
  DocumentFolder,
  FolderStore,
  IssuedFilter,
  IssuingTx,
  NewOutboxEntry,
  NewPolicy,
  NewTemplate,
  DocumentPolicy,
  OutboxEntry,
  OutboxFilter,
  OutboxOutcome,
  OutboxStore,
  PolicyStep,
  PolicyStore,
  PolicyVersion,
  Scope,
  TemplateStore,
  TemplateVersion,
} from '../ports';

/**
 * In-memory implementations of the ports, for tests of the package and of
 * code that uses it. They follow the same rules as the database: unique
 * active template per scope, immutable versions, transactions that roll back.
 */

const clone = <T>(value: T): T => structuredClone(value);

export class MemoryTemplateStore implements TemplateStore {
  readonly templates = new Map<string, DocumentTemplate>();
  readonly versions = new Map<string, TemplateVersion>();

  private versionKey = (id: string, version: number) => `${id}#${version}`;

  async findById(id: string) {
    const template = this.templates.get(id);
    return template ? clone(template) : null;
  }

  async findForScope(scope: Scope, type: DocumentTypeKey) {
    const found = [...this.templates.values()].find(
      (t) =>
        t.schoolId === scope.schoolId &&
        t.subSchoolId === scope.subSchoolId &&
        t.documentType === type &&
        t.archivedAt === null,
    );
    return found ? clone(found) : null;
  }

  async listForSchool(schoolId: string) {
    return [...this.templates.values()].filter((t) => t.schoolId === schoolId).map(clone);
  }

  async insert(input: NewTemplate) {
    const now = new Date();
    const template: DocumentTemplate = {
      ...clone(input),
      id: randomUUID(),
      activeVersion: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.templates.set(template.id, template);
    return clone(template);
  }

  private mustGet(id: string) {
    const template = this.templates.get(id);
    if (!template) throw new DocumentError('NOT_FOUND', `Template ${id} not found`);
    return template;
  }

  async saveDraft(id: string, layout: LayoutInput) {
    const template = this.mustGet(id);
    template.draftLayout = clone(layout);
    template.updatedAt = new Date();
  }

  async findVersion(id: string, version: number) {
    const found = this.versions.get(this.versionKey(id, version));
    return found ? clone(found) : null;
  }

  async listVersions(id: string) {
    return [...this.versions.values()]
      .filter((v) => v.templateId === id)
      .sort((a, b) => a.version - b.version)
      .map(clone);
  }

  async latestVersion(id: string) {
    return Math.max(
      0,
      ...[...this.versions.values()].filter((v) => v.templateId === id).map((v) => v.version),
    );
  }

  async appendVersion(version: TemplateVersion) {
    const key = this.versionKey(version.templateId, version.version);
    if (this.versions.has(key))
      throw new DocumentError('CONFLICT', `Version ${version.version} already exists`);
    this.versions.set(key, clone(version));
  }

  async setActive(id: string, version: number) {
    const template = this.mustGet(id);
    if (!this.versions.has(this.versionKey(id, version))) {
      throw new DocumentError('NOT_FOUND', `Version ${version} of template ${id} not found`);
    }
    template.activeVersion = version;
    template.updatedAt = new Date();
  }

  async archive(id: string, at: Date) {
    this.mustGet(id).archivedAt = at;
  }

  async update(
    id: string,
    patch: Partial<Pick<DocumentTemplate, 'name' | 'folderId' | 'position'>>,
  ) {
    Object.assign(this.mustGet(id), clone(patch), { updatedAt: new Date() });
  }

  async delete(id: string) {
    this.mustGet(id);
    if ([...this.versions.values()].some((v) => v.templateId === id)) {
      // Like the foreign key of document_template_versions.
      throw new DocumentError('CONFLICT', 'A published template cannot be deleted');
    }
    this.templates.delete(id);
  }
}

export class MemoryFolderStore implements FolderStore {
  readonly folders = new Map<string, DocumentFolder>();

  async listForSchool(schoolId: string) {
    return [...this.folders.values()].filter((f) => f.schoolId === schoolId).map(clone);
  }

  async findById(id: string) {
    const folder = this.folders.get(id);
    return folder ? clone(folder) : null;
  }

  async insert(input: Pick<DocumentFolder, 'schoolId' | 'parentId' | 'name' | 'position'>) {
    const now = new Date();
    const folder: DocumentFolder = {
      ...clone(input),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.folders.set(folder.id, folder);
    return clone(folder);
  }

  async update(id: string, patch: Partial<Pick<DocumentFolder, 'name' | 'parentId' | 'position'>>) {
    const folder = this.folders.get(id);
    if (!folder) throw new DocumentError('NOT_FOUND', `Folder ${id} not found`);
    Object.assign(folder, clone(patch), { updatedAt: new Date() });
  }

  async delete(id: string) {
    this.folders.delete(id);
  }
}

const matches = (d: IssuedDocument, filter: IssuedFilter) =>
  (!filter.schoolId || d.schoolId === filter.schoolId) &&
  (!filter.subSchoolId || d.subSchoolId === filter.subSchoolId) &&
  (!filter.documentType || d.documentType === filter.documentType) &&
  (!filter.subjectType || d.subjectType === filter.subjectType) &&
  (!filter.subjectId || d.subjectId === filter.subjectId) &&
  (!filter.replacesId || d.replacesId === filter.replacesId) &&
  (!filter.status || d.status === filter.status);

const listDocuments = (documents: Iterable<IssuedDocument>, filter: IssuedFilter) =>
  [...documents]
    .filter((d) => matches(d, filter))
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
    .slice(0, filter.limit)
    .map(clone);

/**
 * Its transactions also write the outbox given here: the entries of a
 * transaction appear with its documents, and vanish with them on rollback.
 */
export class MemoryIssuedDocumentStore implements IssuedDocumentStore {
  readonly documents = new Map<string, IssuedDocument>();
  readonly counters = new Map<string, number>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(readonly outbox: MemoryOutboxStore = new MemoryOutboxStore()) {}

  /** Transactions run one after the other and roll back on error, like a locked counter row. */
  transaction<T>(work: (tx: IssuingTx) => Promise<T>): Promise<T> {
    const run = async () => {
      const documents = new Map(this.documents);
      const counters = new Map(this.counters);
      const enqueued: NewOutboxEntry[] = [];
      const tx: IssuingTx = {
        // Transactions already run one at a time.
        lockSubject: async () => undefined,
        listIssued: async (filter) => listDocuments(documents.values(), filter),
        enqueue: async (entries) => {
          for (const entry of entries) {
            if (!documents.has(entry.issuedDocumentId)) {
              throw new Error(`Outbox entry for unknown document ${entry.issuedDocumentId}`);
            }
          }
          enqueued.push(...clone(entries));
        },
        nextNumber: async (subSchoolId, type, period) => {
          const key = `${subSchoolId}|${type}|${period}`;
          const next = (counters.get(key) ?? 0) + 1;
          counters.set(key, next);
          return next;
        },
        insert: async (doc) => {
          const duplicate = [...documents.values()].some(
            (d) =>
              d.subSchoolId === doc.subSchoolId &&
              d.documentType === doc.documentType &&
              d.number === doc.number,
          );
          if (documents.has(doc.id) || duplicate)
            throw new DocumentError('CONFLICT', `Document ${doc.number} already exists`);
          documents.set(doc.id, clone(doc));
        },
        revoke: async (id, reason, at) => {
          const doc = documents.get(id);
          if (!doc) throw new DocumentError('NOT_FOUND', `Document ${id} not found`);
          if (doc.status !== 'issued') throw new DocumentError('CONFLICT', 'Already revoked');
          documents.set(id, { ...doc, status: 'revoked', revokedAt: at, revokedReason: reason });
        },
      };
      const result = await work(tx);
      this.documents.clear();
      documents.forEach((doc, id) => this.documents.set(id, doc));
      this.counters.clear();
      counters.forEach((value, key) => this.counters.set(key, value));
      this.outbox.add(enqueued);
      return result;
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  async findById(id: string) {
    const doc = this.documents.get(id);
    return doc ? clone(doc) : null;
  }

  async list(filter: IssuedFilter) {
    return listDocuments(this.documents.values(), filter);
  }
}

export class MemoryFileStore implements FileStore {
  readonly files = new Map<string, { bytes: Uint8Array; mime: string }>();

  async put(key: string, bytes: Uint8Array, mime: string) {
    this.files.set(key, { bytes: new Uint8Array(bytes), mime });
  }

  async get(key: string) {
    const file = this.files.get(key);
    if (!file) throw new DocumentError('NOT_FOUND', `File ${key} not found`);
    return new Uint8Array(file.bytes);
  }
}

export class MemoryAssetStore implements AssetStore {
  readonly assets = new Map<string, { schoolId: string; file: AssetFile }>();

  add(schoolId: string, file: AssetFile, id: string = randomUUID()): string {
    this.assets.set(id, { schoolId, file });
    return id;
  }

  async listIds(schoolId: string) {
    return new Set([...this.assets].filter(([, a]) => a.schoolId === schoolId).map(([id]) => id));
  }

  async load(schoolId: string, ids: readonly string[]) {
    const found = new Map<string, AssetFile>();
    for (const id of ids) {
      const asset = this.assets.get(id);
      if (asset?.schoolId === schoolId) found.set(id, asset.file);
    }
    return found;
  }
}

export class MemoryPolicyStore implements PolicyStore {
  readonly policies = new Map<string, DocumentPolicy>();
  readonly versions = new Map<string, PolicyVersion>();

  private versionKey = (id: string, version: number) => `${id}#${version}`;

  private mustGet(id: string) {
    const policy = this.policies.get(id);
    if (!policy) throw new DocumentError('NOT_FOUND', `Policy ${id} not found`);
    return policy;
  }

  async findById(id: string) {
    const policy = this.policies.get(id);
    return policy ? clone(policy) : null;
  }

  async findForScope(scope: Scope, type: DocumentTypeKey) {
    const found = [...this.policies.values()].find(
      (p) =>
        p.schoolId === scope.schoolId &&
        p.subSchoolId === scope.subSchoolId &&
        p.documentType === type &&
        p.archivedAt === null,
    );
    return found ? clone(found) : null;
  }

  async listForSchool(schoolId: string) {
    return [...this.policies.values()].filter((p) => p.schoolId === schoolId).map(clone);
  }

  /** Like the partial unique indexes: one live policy per scope and type. */
  async insert(input: NewPolicy) {
    if (await this.findForScope(input, input.documentType)) {
      throw new DocumentError('CONFLICT', `A ${input.documentType} policy already exists here`);
    }
    const now = new Date();
    const policy: DocumentPolicy = {
      ...clone(input),
      id: randomUUID(),
      activeVersion: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.policies.set(policy.id, policy);
    return clone(policy);
  }

  async saveDraft(id: string, steps: PolicyStep[]) {
    const policy = this.mustGet(id);
    policy.draftSteps = clone(steps);
    policy.updatedAt = new Date();
  }

  async findVersion(id: string, version: number) {
    const found = this.versions.get(this.versionKey(id, version));
    return found ? clone(found) : null;
  }

  async listVersions(id: string) {
    return [...this.versions.values()]
      .filter((v) => v.policyId === id)
      .sort((a, b) => a.version - b.version)
      .map(clone);
  }

  async latestVersion(id: string) {
    return Math.max(
      0,
      ...[...this.versions.values()].filter((v) => v.policyId === id).map((v) => v.version),
    );
  }

  async appendVersion(version: PolicyVersion) {
    const key = this.versionKey(version.policyId, version.version);
    if (this.versions.has(key)) {
      throw new DocumentError('CONFLICT', `Version ${version.version} already exists`);
    }
    this.versions.set(key, clone(version));
  }

  async setActive(id: string, version: number) {
    const policy = this.mustGet(id);
    if (!this.versions.has(this.versionKey(id, version))) {
      throw new DocumentError('NOT_FOUND', `Version ${version} of policy ${id} not found`);
    }
    policy.activeVersion = version;
    policy.updatedAt = new Date();
  }

  async archive(id: string, at: Date) {
    this.mustGet(id).archivedAt = at;
  }
}

/** Entries taken by a worker are skipped by the others until it is done, like SKIP LOCKED. */
export class MemoryOutboxStore implements OutboxStore {
  readonly entries = new Map<string, OutboxEntry>();
  private readonly locked = new Set<string>();

  /** Called by the issued store when its transaction commits. */
  add(entries: NewOutboxEntry[]) {
    for (const entry of entries) {
      this.entries.set(entry.id, {
        ...clone(entry),
        status: 'pending',
        attempts: 0,
        lastError: null,
        doneAt: null,
        createdAt: entry.nextAttemptAt,
      });
    }
  }

  async processNext(now: Date, work: (entry: OutboxEntry) => Promise<OutboxOutcome>) {
    // Chosen and locked synchronously: a concurrent call cannot pick the same one.
    const entry = [...this.entries.values()]
      .filter((e) => e.status === 'pending' && e.nextAttemptAt <= now && !this.locked.has(e.id))
      .sort((a, b) => a.nextAttemptAt.getTime() - b.nextAttemptAt.getTime())[0];
    if (!entry) return null;
    this.locked.add(entry.id);
    try {
      const outcome = await work(clone(entry));
      entry.attempts = outcome.attempts;
      entry.status = outcome.status;
      if (outcome.status === 'done') entry.doneAt = outcome.at;
      else entry.lastError = outcome.error;
      if (outcome.status === 'pending') entry.nextAttemptAt = outcome.nextAttemptAt;
      return clone(entry);
    } finally {
      this.locked.delete(entry.id);
    }
  }

  async findById(id: string) {
    const entry = this.entries.get(id);
    return entry ? clone(entry) : null;
  }

  async list(filter: OutboxFilter) {
    return [...this.entries.values()]
      .filter(
        (e) =>
          (!filter.schoolId || e.schoolId === filter.schoolId) &&
          (!filter.status || e.status === filter.status) &&
          (!filter.issuedDocumentId || e.issuedDocumentId === filter.issuedDocumentId),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, filter.limit)
      .map(clone);
  }

  async retry(id: string, now: Date) {
    const entry = this.entries.get(id);
    if (!entry) throw new DocumentError('NOT_FOUND', `Outbox entry ${id} not found`);
    if (entry.status !== 'failed') {
      throw new DocumentError('CONFLICT', 'Only a failed action can be retried');
    }
    Object.assign(entry, { status: 'pending', attempts: 0, nextAttemptAt: now });
  }
}
