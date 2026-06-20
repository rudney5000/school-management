import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { teacherAttendanceApi } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

type DeletePayload = {
    id:          string;
    subSchoolId: string;
};

export const useDeleteTeacherAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, DeletePayload>({
        mutationFn: async ({ id, subSchoolId }) => {
            const response = await teacherAttendanceApi.delete(id, subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-attendances'] });
            queryClient.removeQueries({ queryKey: ['teacher-attendance', id] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};