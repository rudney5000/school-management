import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';
import type { StudentAttendance } from '@entities/attendances';
import { useEffect } from 'react';

export const useStudentAttendance = (id: string, subSchoolId: string) => {
    const query = useQuery<StudentAttendance, Error>({
        queryKey: ['student-attendance', id],
        queryFn: async () => {
            const response = await studentAttendanceApi.getById({ id }, subSchoolId);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as StudentAttendance;
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