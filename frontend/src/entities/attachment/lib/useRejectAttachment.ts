import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import {
    attachmentApi
} from '@entities/attachment/api/attachment.api'
import type {
    AttachmentParamsDto
} from '@entities/attachment/model/dto'
import type {
    RejectAttachmentDto
} from '@entities/attachment/model/createAttachmentSchema'
import type {Attachment} from "@entities/attachment";
import type {CommonError} from "@shared/helperClass/CommonError";

type RejectAttachmentInput = AttachmentParamsDto & RejectAttachmentDto

export const useRejectAttachment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, reason }: RejectAttachmentInput): Promise<Attachment> => {
            const response = await attachmentApi.reject({ id }, { reason })

            if (!response.IsSuccess) {
                const apiError = response.result as CommonError
                throw new Error(apiError.Message)
            }

            return response.result as Attachment
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['attachments'],
            })
        },
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
