import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { AttachmentParamsDto } from '@entities/attachment/model/dto'
import type { RejectAttachmentDto } from '@entities/attachment/model/createAttachmentSchema'

type RejectAttachmentInput = AttachmentParamsDto & RejectAttachmentDto

export const useRejectAttachment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: RejectAttachmentInput) =>
            attachmentApi.reject({ id }, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments'] })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
