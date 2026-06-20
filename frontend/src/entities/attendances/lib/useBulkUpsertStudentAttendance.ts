import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { BulkUpsertStudentAttendanceDto, StudentAttendance } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

export const useBulkUpsertStudentAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentAttendance[], Error, BulkUpsertStudentAttendanceDto>({
        mutationFn: async (dto) => {
            const response = await studentAttendanceApi.bulkUpsert(dto);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as StudentAttendance[];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-attendances'] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};