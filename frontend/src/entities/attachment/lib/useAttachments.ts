import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleApiError } from '@shared/lib'
import type { CommonError } from '@shared/helperClass/CommonError'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { Attachment } from '@entities/attachment/model/types'
import type { ListAttachmentsQueryDto } from '@entities/attachment/model/dto'

export const useAttachments = (params: ListAttachmentsQueryDto | undefined) => {
    const query = useQuery<Attachment[], Error>({
        queryKey: ['attachments', params],
        enabled:  !!params?.attachableType && !!params?.attachableId,
        queryFn:  async (): Promise<Attachment[]> => {
            if (!params) return []

            const response = await attachmentApi.list(params)

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as Attachment[]
        },
    })

    useEffect(() => {
        if (query.isError && query.error && !query.data) {
            handleApiError(query.error)
        }
    }, [query.isError, query.error, query.data])

    return query
}
