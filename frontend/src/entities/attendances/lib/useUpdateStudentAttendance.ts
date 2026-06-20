import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { UpdateStudentAttendanceDto, StudentAttendance } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

type UpdatePayload = {
    id:         string;
    subSchoolId: string;
    dto:        UpdateStudentAttendanceDto;
};

export const useUpdateStudentAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentAttendance, Error, UpdatePayload>({
        mutationFn: async ({ id, subSchoolId, dto }) => {
            const response = await studentAttendanceApi.update(id, subSchoolId, dto);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as StudentAttendance;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['student-attendances'] });
            queryClient.invalidateQueries({ queryKey: ['student-attendance', id] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};