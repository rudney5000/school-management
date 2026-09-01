import { useAppSelector } from '@/shared/store/hooks';
import { useSchedules } from './useSchedules';
import { useMyChildrenSchedules } from '@entities/schedule';

export const useSchedulesList = (subSchoolId?: string) => {
  const role = useAppSelector((s) => s.auth.role);
  const isParent = role === 'parent';

  const allSchedules = useSchedules(isParent ? undefined : subSchoolId);
  const childrenSchedules = useMyChildrenSchedules(isParent ? subSchoolId : undefined);

  return isParent ? childrenSchedules : allSchedules;
};
