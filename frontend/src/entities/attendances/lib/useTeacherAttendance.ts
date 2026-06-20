import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { teacherAttendanceApi } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';
import type { TeacherAttendance } from '@entities/attendances';
import { useEffect } from 'react';

export const useTeacherAttendance = (id: string, subSchoolId: string) => {
    const query = useQuery<TeacherAttendance, Error>({
        queryKey: ['teacher-attendance', id],
        queryFn: async () => {
            const response = await teacherAttendanceApi.getById({ id }, subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as TeacherAttendance;
        },
        enabled: !!id && !!subSchoolId,
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};