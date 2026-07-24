import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api'
import type { SignatureStatusResult } from '@entities/document-signature/model/types'
import type { BulletinSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema'

export const useBulletinSignatureStatus = (params: BulletinSignDto | undefined) => {
    const query = useQuery<SignatureStatusResult, Error>({
        queryKey: ['document-signature', 'bulletin', 'status', params],
        enabled:  !!params?.subSchoolId
            && !!params?.classId
            && !!params?.studentId
            && !!params?.academicPeriodId,
        queryFn: async (): Promise<SignatureStatusResult> => {
            if (!params) return { isSigned: false }

            const response = await documentSignatureApi.getBulletinStatus(params)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as SignatureStatusResult
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error, query.data])

    return query
}
