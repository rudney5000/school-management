export const ATTACHABLE_TYPES = [
  'message',
  'conversation',
  'enrollment',
  'payment',
  'teacher',
] as const;

export type AttachableType = (typeof ATTACHABLE_TYPES)[number];

export const ATTACHMENT_CATEGORIES = [
  'birth_certificate',
  'medical_certificate',
  'previous_report',
  'parent_id',
  'student_photo',
  'teacher_photo',
  'payment_receipt',
  'diploma',
  'criminal_record',
  'resume',
  'identity_document',
  'guardianship_proof',
  'other',
] as const;

export type AttachmentCategory = (typeof ATTACHMENT_CATEGORIES)[number];

export type AttachmentStatus = 'pending' | 'validated' | 'rejected';

export type Attachment = {
  id: string;
  attachableType: AttachableType;
  attachableId: string;
  category: AttachmentCategory;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  status: AttachmentStatus;
  rejectionReason: string | null;
  validatedBy: string | null;
  validatedAt: string | null;
  createdAt: string;
};
