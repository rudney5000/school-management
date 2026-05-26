declare global {
  namespace Express {
    type User = {
      id: string;
      email: string;
      role: string;
      schoolId: string;
      subSchoolId?: string;
    };

    interface Request {
      user?: User;
    }
  }
}

export type UserRole =
    | 'super_admin'
    | 'admin'
    | 'director'
    | 'teacher'
    | 'parent'
    | 'student';

export {};
