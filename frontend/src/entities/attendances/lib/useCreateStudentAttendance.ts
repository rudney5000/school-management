import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { CreateStudentAttendanceDto, StudentAttendance } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

export const useCreateStudentAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentAttendance, Error, CreateStudentAttendanceDto>({
        mutationFn: async (dto) => {
            const response = await studentAttendanceApi.create(dto);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as StudentAttendance;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-attendances'] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};