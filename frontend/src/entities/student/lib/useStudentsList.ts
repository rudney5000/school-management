import { useAppSelector } from '@/shared/store/hooks';
import { useMyChildren, useStudents } from '@entities/student';

export const useStudentsList = (subSchoolId?: string) => {
  const role = useAppSelector((s) => s.auth.role);
  const isParent = role === 'parent';

  const allStudents = useStudents(isParent ? undefined : subSchoolId);
  const myChildren = useMyChildren(isParent ? (subSchoolId ?? '') : '');

  return isParent ? myChildren : allStudents;
};
