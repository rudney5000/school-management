import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import {
    type Enrollment,
    enrollmentApi
} from "@entities/enrollment";

export const useStudentEnrollment = (studentId: string | undefined) => {
    const query = useQuery<Enrollment[], Error>({
        queryKey: ['enrollments', 'list', { studentId }],
        enabled:  !!studentId,
        queryFn: async (): Promise<Enrollment[]> => {
            const response = await enrollmentApi.getAll({ studentId })

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as Enrollment[]
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error, query.data])

    return { ...query, enrollment: query.data?.[0] }
}