export type UserRole =
  | 'admin'
  | 'super_admin'
  | 'director'
  | 'teacher'
  | 'worker'
  | 'parent'
  | 'student';

// Register and login diverge on purpose: registration accepts any
// combination of email/phone/username (at least one), while login takes a
// single identifier that could be any of the three.
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
