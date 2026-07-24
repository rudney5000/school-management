import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { AttachmentParamsDto } from '@entities/attachment/model/dto'

export const useValidateAttachment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (params: AttachmentParamsDto) => attachmentApi.validate(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
