import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import type { CommonError } from '@shared/helperClass/CommonError';
import { type CreateEnrollmentDto, type Enrollment, enrollmentApi } from '@entities/enrollment';

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateEnrollmentDto): Promise<Enrollment> => {
      const response = await enrollmentApi.create(dto);

      if (!response.IsSuccess) {
        const apiError = response.result as CommonError;
        throw new Error(apiError.Message);
      }

      return response.result as Enrollment;
    },
    onSuccess: (enrollment) => {
      queryClient.invalidateQueries({
        queryKey: ['enrollments', 'list', { studentId: enrollment.studentId }],
      });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
