import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { teacherAttendanceApi } from '@entities/attendances';
import type { UpdateTeacherAttendanceDto, TeacherAttendance } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

type UpdatePayload = {
    id:          string;
    subSchoolId: string;
    dto:         UpdateTeacherAttendanceDto;
};

export const useUpdateTeacherAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<TeacherAttendance, Error, UpdatePayload>({
        mutationFn: async ({ id, subSchoolId, dto }) => {
            const response = await teacherAttendanceApi.update(id, subSchoolId, dto);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as TeacherAttendance;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-attendances'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-attendance', id] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};