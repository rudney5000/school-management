import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { PresignUploadDto } from '@entities/attachment/model/createAttachmentSchema'

export const usePresignAttachment = () => {
    return useMutation({
        mutationFn: (dto: PresignUploadDto) => attachmentApi.presign(dto),
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
