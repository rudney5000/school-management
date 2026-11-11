export type IssuedDocumentType =
  | 'bulletin'
  | 'receipt'
  | 'certificate'
  | 'diploma'
  | 'enrollment'
  | 'reenrollment'
  | 'supplies'
  | 'free';

/** What GET /documents/verify/:id returns: identity only, never grades or amounts. */
export interface DocumentVerification {
  id: string;
  documentType: IssuedDocumentType;
  number: string;
  schoolName: string;
  /** Partly masked: "M*** K*** M***". */
  holderName: string | null;
  /** YYYY-MM-DD, in the school's time zone. */
  issuedAt: string;
  status: 'issued' | 'revoked';
  revokedAt: string | null;
  /** Number of the document that corrects this one. */
  replacedBy: string | null;
}

/** A document as the staff sees it, in GET /documents/issued. */
export interface IssuedDocument {
  id: string;
  subSchoolId: string;
  documentType: IssuedDocumentType;
  number: string;
  subjectId: string | null;
  templateId: string;
  templateVersion: number;
  /** Frozen data printed on the document; its shape depends on the type. */
  payload: {
    student?: { fullName: string };
    class?: { name: string };
    period?: { name: string; schoolYear: string };
    totals?: { percent: number };
  };
  status: 'issued' | 'revoked';
  revokedAt: string | null;
  revokedReason: string | null;
  replacesId: string | null;
  issuedAt: string;
}

export interface IssueBulletinDto {
  subSchoolId: string;
  studentId: string;
  classId: string;
  academicPeriodId: string;
  replaces?: { id: string; reason: string };
}

export interface DocumentTemplate {
  id: string;
  schoolId: string;
  /** null: the template of the whole group. */
  subSchoolId: string | null;
  documentType: IssuedDocumentType;
  name: string;
  folderId: string | null;
  position: number;
  draftLayout: Record<string, unknown> | null;
  activeVersion: number | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  templateId: string;
  version: number;
  layout: Record<string, unknown>;
  note: string | null;
  publishedAt: string;
}

export interface TemplateStarter {
  key: string;
  name: string;
  documentType: IssuedDocumentType;
}

export interface DocumentFolder {
  id: string;
  parentId: string | null;
  name: string;
  position: number;
  updatedAt: string;
}

export interface TemplateLibrary {
  folders: DocumentFolder[];
  templates: DocumentTemplate[];
}

/** What a template of a type may contain (GET /documents/types/:type). */
export interface DocumentTypeInfo {
  key: IssuedDocumentType;
  variables: Array<{ path: string; kind: 'text' | 'number' | 'date'; nullable: boolean }>;
  blocks: string[];
  requiredBlocks: string[];
  /** Data the previews are drawn with. */
  sample: Record<string, unknown>;
}
