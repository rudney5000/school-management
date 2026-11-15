import type { curricula } from '@/db/schema';

export type CurriculumRecord = typeof curricula.$inferSelect;

/**
 * Who is reading, and therefore what they may see.
 * - `manager` (admin, director, super_admin): every programme of the sub-school, drafts included.
 * - `teacher`: the published programmes of the sub-school.
 * - `family` (parent, student): the published programmes of their own classes only.
 */
export type CurriculumViewer =
  | { kind: 'manager'; subSchoolId: string }
  | { kind: 'teacher'; subSchoolId: string }
  | { kind: 'family'; classIds: string[] };

export interface CurriculumClass {
  id: string;
  name: string;
  gradeLevel: string | null;
}

export interface CurriculumCourse {
  id: string;
  name: string;
  code: string;
}

export interface CurriculumFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

/** A programme as lists show it. */
export interface CurriculumSummary extends CurriculumRecord {
  classes: CurriculumClass[];
  course: CurriculumCourse | null;
  fileCount: number;
}

/** A programme as its detail page shows it, with its files. */
export interface CurriculumDetail extends CurriculumSummary {
  files: CurriculumFile[];
}

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
}

export interface SignedDownload {
  url: string;
  filename: string;
  expiresIn: number;
}
