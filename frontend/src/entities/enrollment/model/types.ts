export type EnrollmentStatus = 'draft' | 'complete';

export type Enrollment = {
  id: string;
  studentId: string;
  classId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
};
