import { useAppSelector } from '@/shared/store/hooks';
import { useCourses } from './useCourses';
import { useMyChildrenCourses } from '@entities/courses';

export const useCoursesList = (subSchoolId?: string) => {
  const role = useAppSelector((s) => s.auth.role);
  const isParent = role === 'parent';

  const allCourses = useCourses(isParent ? undefined : subSchoolId);
  const childrenCourses = useMyChildrenCourses(isParent ? (subSchoolId ?? '') : '');

  return isParent ? childrenCourses : allCourses;
};
