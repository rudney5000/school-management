import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { ConfirmUploadDto } from '@entities/attachment/model/createAttachmentSchema'

export const useConfirmAttachment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (dto: ConfirmUploadDto) => attachmentApi.confirm(dto),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['attachments', {
                    attachableType: variables.attachableType,
                    attachableId:   variables.attachableId,
                }],
            })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
