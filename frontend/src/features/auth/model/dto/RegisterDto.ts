export type UserRole =
  | 'admin'
  | 'super_admin'
  | 'director'
  | 'teacher'
  | 'worker'
  | 'parent'
  | 'student';

export interface RegisterDto {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
  role: UserRole;
  workerId?: string;
  parentId?: string;
  studentId?: string;
  teacherId?: string;
}
