import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import {
    teacherAttendanceApi
} from '@entities/attendances';
import type {
    CommonError
} from '@shared/helperClass/CommonError';
import type {
    TeacherAttendance,
    PaginatedAttendance,
    AttendanceQueryDto
} from '@entities/attendances';

export const useMyChildrenTeacherAttendances = (params: AttendanceQueryDto) => {
    const query = useQuery<PaginatedAttendance<TeacherAttendance>, Error>({
        queryKey: ['my-children-teacher-attendances', params],
        queryFn: async () => {
            const response = await teacherAttendanceApi.getMyChildrenTeachers(params);
            if (!response.IsSuccess) {
                const apiError = response.result as CommonError;
                throw new Error(apiError.Message);
            }
            return response.result as PaginatedAttendance<TeacherAttendance>;
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