import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleApiError } from '@shared/lib'
import type {
    CommonError
} from '@shared/helperClass/CommonError'
import {
    type TeacherDossierStatusDto,
    teacherApi
} from '@entities/teacher'

export const useTeacherDossierStatus = (params: { id: string; subSchoolId: string } | undefined) => {
    const query = useQuery<TeacherDossierStatusDto, Error>({
        queryKey: ['teachers', 'dossier-status', params],
        enabled:  !!params?.id && !!params?.subSchoolId,
        queryFn: async (): Promise<TeacherDossierStatusDto> => {
            if (!params) return { isComplete: false, missing: [] }

            const response = await teacherApi.getDossierStatus(params)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as TeacherDossierStatusDto
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error, query.data])

    return query
}