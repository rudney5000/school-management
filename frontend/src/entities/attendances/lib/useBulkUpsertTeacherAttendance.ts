import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { teacherAttendanceApi } from '@entities/attendances';
import type { BulkUpsertTeacherAttendanceDto, TeacherAttendance } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';

export const useBulkUpsertTeacherAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation<TeacherAttendance[], Error, BulkUpsertTeacherAttendanceDto>({
        mutationFn: async (dto) => {
            const response = await teacherAttendanceApi.bulkUpsert(dto);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as TeacherAttendance[];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-attendances'] });
        },
        onError: (error) => {
            handleApiError(error);
        },
    });
};