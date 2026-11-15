export const CURRICULUM_TYPES = ['national', 'school'] as const;
export type CurriculumType = (typeof CURRICULUM_TYPES)[number];

export type CurriculumStatus = 'draft' | 'published';

/** File types the backend accepts for a programme, up to 25 MB. */
export const CURRICULUM_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export type CurriculumFileType = (typeof CURRICULUM_FILE_TYPES)[number];
export const CURRICULUM_MAX_FILE_SIZE = 25 * 1024 * 1024;

export type CurriculumClass = {
  id: string;
  name: string;
  gradeLevel: string | null;
};

export type CurriculumFile = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type Curriculum = {
  id: string;
  subSchoolId: string;
  title: string;
  description: string | null;
  type: CurriculumType;
  courseId: string | null;
  schoolYear: string;
  status: CurriculumStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  classes: CurriculumClass[];
  course: { id: string; name: string; code: string } | null;
  fileCount: number;
};

export type CurriculumDetail = Curriculum & { files: CurriculumFile[] };

export type CurriculumListQuery = {
  subSchoolId?: string;
  classId?: string;
  courseId?: string;
  schoolYear?: string;
  type?: CurriculumType;
  status?: CurriculumStatus;
};

export type CreateCurriculumDto = {
  title: string;
  description?: string;
  type: CurriculumType;
  courseId?: string;
  schoolYear: string;
  classIds: string[];
};

export type UpdateCurriculumDto = Partial<Omit<CreateCurriculumDto, 'description' | 'courseId'>> & {
  description?: string | null;
  courseId?: string | null;
};

/** The school year in progress, such as "2026-2027", counted from September. */
export function currentSchoolYear(now = new Date()): string {
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${start + 1}`;
}
