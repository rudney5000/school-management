import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { studentAttendanceApi } from '@entities/attendances';
import type { CommonError } from '@shared/helperClass/CommonError';
import type { StudentAttendance, PaginatedAttendance, AttendanceQueryDto } from '@entities/attendances';
import { useEffect } from 'react';

export const useStudentAttendances = (params: AttendanceQueryDto) => {
    const query = useQuery<PaginatedAttendance<StudentAttendance>, Error>({
        queryKey: ['student-attendances', params],
        queryFn: async () => {
            const response = await studentAttendanceApi.getAll(params);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as PaginatedAttendance<StudentAttendance>;
        },
        enabled: !!params.subSchoolId,
    });

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error);
        }
    }, [query.isError, query.error]);

    return query;
};