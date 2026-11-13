import type { DocumentTypeKey, SubjectType } from './document-types/define';
import type { AssetFile } from './blocks/context';
import type { LayoutInput } from './engine/layout';
import type { PolicyEvent } from './policies/define';

/**
 * What the package asks of the application. The backend implements these
 * with Drizzle and S3; tests use the in-memory versions from
 * `@school-hub/documents/testing`.
 */

/** A template belongs to a whole group (subSchoolId null) or to one of its sub-schools. */
export interface Scope {
  schoolId: string;
  subSchoolId: string | null;
}

export interface DocumentTemplate {
  id: string;
  schoolId: string;
  subSchoolId: string | null;
  documentType: DocumentTypeKey;
  name: string;
  /** The folder it is filed in, null at the root of the school's tree. */
  folderId: string | null;
  /** Order among the items of its folder. */
  position: number;
  draftLayout: LayoutInput | null;
  activeVersion: number | null;
  archivedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewTemplate = Pick<
  DocumentTemplate,
  | 'schoolId'
  | 'subSchoolId'
  | 'documentType'
  | 'name'
  | 'draftLayout'
  | 'createdBy'
  | 'folderId'
  | 'position'
>;

/** A published version. Never updated, never deleted. */
export interface TemplateVersion {
  templateId: string;
  version: number;
  layout: LayoutInput;
  layoutFormat: number;
  note: string | null;
  publishedBy: string;
  publishedAt: Date;
}

export interface TemplateStore {
  findById(id: string): Promise<DocumentTemplate | null>;
  /** The non-archived template of this exact scope (sub-school OR group). */
  findForScope(scope: Scope, type: DocumentTypeKey): Promise<DocumentTemplate | null>;
  listForSchool(schoolId: string): Promise<DocumentTemplate[]>;
  insert(template: NewTemplate): Promise<DocumentTemplate>;
  saveDraft(id: string, layout: LayoutInput): Promise<void>;
  findVersion(id: string, version: number): Promise<TemplateVersion | null>;
  listVersions(id: string): Promise<TemplateVersion[]>;
  latestVersion(id: string): Promise<number>;
  /** Fails with CONFLICT when the version already exists. */
  appendVersion(version: TemplateVersion): Promise<void>;
  setActive(id: string, version: number): Promise<void>;
  archive(id: string, at: Date): Promise<void>;
  /** Name, folder and order: how the template is filed, never its content. */
  update(
    id: string,
    patch: Partial<Pick<DocumentTemplate, 'name' | 'folderId' | 'position'>>,
  ): Promise<void>;
  /** Only for a template never published: published versions are kept forever. */
  delete(id: string): Promise<void>;
}

/** A folder of the school's template tree. Folders only file templates: they carry no rule. */
export interface DocumentFolder {
  id: string;
  schoolId: string;
  /** null at the root. */
  parentId: string | null;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderStore {
  listForSchool(schoolId: string): Promise<DocumentFolder[]>;
  findById(id: string): Promise<DocumentFolder | null>;
  insert(
    folder: Pick<DocumentFolder, 'schoolId' | 'parentId' | 'name' | 'position'>,
  ): Promise<DocumentFolder>;
  update(
    id: string,
    patch: Partial<Pick<DocumentFolder, 'name' | 'parentId' | 'position'>>,
  ): Promise<void>;
  delete(id: string): Promise<void>;
}

export type IssuedStatus = 'issued' | 'revoked';

export interface IssuedDocument {
  /** Generated before rendering: it is printed in the QR code. */
  id: string;
  schoolId: string;
  subSchoolId: string;
  documentType: DocumentTypeKey;
  number: string;
  /** null for a free document, which is about no record of the app. */
  subjectType: SubjectType | null;
  subjectId: string | null;
  templateId: string;
  templateVersion: number;
  payload: unknown;
  payloadVersion: number;
  contentHash: string;
  pdfKey: string;
  status: IssuedStatus;
  revokedAt: Date | null;
  revokedReason: string | null;
  replacesId: string | null;
  /** The policy applied at issue, null when the school has none: answers "why was it allowed". */
  policyId: string | null;
  policyVersion: number | null;
  issuedBy: string;
  issuedAt: Date;
}

export interface IssuedFilter {
  schoolId?: string;
  subSchoolId?: string;
  documentType?: DocumentTypeKey;
  subjectType?: SubjectType;
  subjectId?: string;
  /** The document that corrects this one. */
  replacesId?: string;
  status?: IssuedStatus;
  /** Most recent first; at most this many. */
  limit?: number;
}

/** Everything done inside one issuing transaction commits or rolls back together. */
export interface IssuingTx {
  /**
   * Held until the transaction ends: two issues about the same subject run one
   * after the other, so a check such as oncePerSubject sees the first one.
   */
  lockSubject(key: string): Promise<void>;
  /** Reads inside the transaction, after the lock: sees what the previous holder committed. */
  listIssued(filter: IssuedFilter): Promise<IssuedDocument[]>;
  /** The after… actions, written with the document: both exist or neither does. */
  enqueue(entries: NewOutboxEntry[]): Promise<void>;
  /** Locks the counter row until commit, so numbers have no gaps and no duplicates. */
  nextNumber(subSchoolId: string, type: DocumentTypeKey, period: string): Promise<number>;
  insert(doc: IssuedDocument): Promise<void>;
  /**
   * Only an issued document can be revoked (UPDATE … WHERE status = 'issued');
   * fails with CONFLICT otherwise, so two concurrent corrections cannot both win.
   */
  revoke(id: string, reason: string, at: Date): Promise<void>;
}

/**
 * Generic on the transaction, so the policy functions the backend implements
 * receive its own transaction and can read its tables in it.
 */
export interface IssuedDocumentStore<Tx extends IssuingTx = IssuingTx> {
  transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T>;
  findById(id: string): Promise<IssuedDocument | null>;
  /** Most recent first. */
  list(filter: IssuedFilter): Promise<IssuedDocument[]>;
}

export interface FileStore {
  put(key: string, bytes: Uint8Array, mime: string): Promise<void>;
  get(key: string): Promise<Uint8Array>;
}

/** Images of a school (logo, stamp, signature, background), stored in template_assets. */
export interface AssetStore {
  /** Ids of every asset the school may use in its templates. */
  listIds(schoolId: string): Promise<Set<string>>;
  /** Loads the given assets of the school; an id of another school is not returned. */
  load(schoolId: string, ids: readonly string[]): Promise<Map<string, AssetFile>>;
}

/**
 * Who is calling. `schoolId: null` is the platform team (super_admin), which
 * sees every school; anyone else only reaches the templates and documents of
 * their own school, and anything else reads as not found.
 */
export interface Actor {
  userId: string;
  schoolId: string | null;
  /** The user's role (director, admin…), read by the requireRole policy function. */
  role?: string;
}

export type Locale = 'fr' | 'en';

/** Implemented by the backend for each document type: reads the data and does the maths. */
export interface Collector<P = unknown, D = unknown> {
  collect(params: P, ctx: { schoolId: string; subSchoolId: string; locale: Locale }): Promise<D>;
}

/** One step of a policy: on this event, run this function of the catalogue with these args. */
export interface PolicyStep {
  on: PolicyEvent;
  fn: string;
  args?: Record<string, unknown>;
}

/**
 * The rules of a group (subSchoolId null) or of a sub-school for one type of
 * document, kept apart from the template: a rule changes without republishing
 * the design. At most one live policy per scope and type.
 */
export interface DocumentPolicy {
  id: string;
  schoolId: string;
  subSchoolId: string | null;
  documentType: DocumentTypeKey;
  /** As last saved; checked again at publication. */
  draftSteps: PolicyStep[] | null;
  activeVersion: number | null;
  archivedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewPolicy = Pick<
  DocumentPolicy,
  'schoolId' | 'subSchoolId' | 'documentType' | 'draftSteps' | 'createdBy'
>;

/** A published version of the steps. Never updated, never deleted. */
export interface PolicyVersion {
  policyId: string;
  version: number;
  steps: PolicyStep[];
  note: string | null;
  publishedBy: string;
  publishedAt: Date;
}

export interface PolicyStore {
  findById(id: string): Promise<DocumentPolicy | null>;
  /** The non-archived policy of this exact scope (sub-school OR group). */
  findForScope(scope: Scope, type: DocumentTypeKey): Promise<DocumentPolicy | null>;
  listForSchool(schoolId: string): Promise<DocumentPolicy[]>;
  /** Fails with CONFLICT when the scope already has a live policy for the type. */
  insert(policy: NewPolicy): Promise<DocumentPolicy>;
  saveDraft(id: string, steps: PolicyStep[]): Promise<void>;
  findVersion(id: string, version: number): Promise<PolicyVersion | null>;
  listVersions(id: string): Promise<PolicyVersion[]>;
  latestVersion(id: string): Promise<number>;
  /** Fails with CONFLICT when the version already exists. */
  appendVersion(version: PolicyVersion): Promise<void>;
  setActive(id: string, version: number): Promise<void>;
  archive(id: string, at: Date): Promise<void>;
}

export type OutboxStatus = 'pending' | 'done' | 'failed';

/** An after… action to run. Its id is also the idempotency key given to the function. */
export interface OutboxEntry {
  id: string;
  schoolId: string;
  issuedDocumentId: string;
  event: PolicyEvent;
  fn: string;
  args: Record<string, unknown>;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: Date;
  lastError: string | null;
  doneAt: Date | null;
  createdAt: Date;
}

/** Due from the clock of the issue, the same clock the worker reads. */
export type NewOutboxEntry = Pick<
  OutboxEntry,
  'id' | 'schoolId' | 'issuedDocumentId' | 'event' | 'fn' | 'args' | 'nextAttemptAt'
>;

/** What the worker records once the action has run. */
export type OutboxOutcome =
  | { status: 'done'; attempts: number; at: Date }
  | { status: 'pending'; attempts: number; nextAttemptAt: Date; error: string }
  | { status: 'failed'; attempts: number; error: string };

export interface OutboxFilter {
  schoolId?: string;
  status?: OutboxStatus;
  issuedDocumentId?: string;
  /** Most recent first; at most this many. */
  limit?: number;
}

export interface OutboxStore {
  /**
   * Takes the oldest due pending entry, locked so no other worker takes it
   * (FOR UPDATE SKIP LOCKED), runs `work` and records its outcome before
   * releasing it. Null when nothing is due.
   */
  processNext(
    now: Date,
    work: (entry: OutboxEntry) => Promise<OutboxOutcome>,
  ): Promise<OutboxEntry | null>;
  findById(id: string): Promise<OutboxEntry | null>;
  list(filter: OutboxFilter): Promise<OutboxEntry[]>;
  /** A failed entry goes back to pending, due now, with its attempts reset. CONFLICT otherwise. */
  retry(id: string, now: Date): Promise<void>;
}
