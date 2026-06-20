import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

type DeletePayload = {
    id:          string;
    subSchoolId: string;
};

export const useDeleteStudentAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, DeletePayload>({
        mutationFn: async ({ id, subSchoolId }) => {
            const response = await studentAttendanceApi.delete(id, subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['student-attendances'] });
            queryClient.removeQueries({ queryKey: ['student-attendance', id] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};