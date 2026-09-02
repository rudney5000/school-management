import type { EnrollmentListQueryDto } from '@entities/enrollment';

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (params?: EnrollmentListQueryDto) => [...enrollmentKeys.lists(), params ?? {}] as const,
};
