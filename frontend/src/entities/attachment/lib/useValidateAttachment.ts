import {
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import type { AttachmentParamsDto } from '@entities/attachment/model/dto'
import type {Attachment} from "@entities/attachment";
import type {CommonError} from "@shared/helperClass/CommonError";

export const useValidateAttachment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: AttachmentParamsDto): Promise<Attachment> => {
            const response = await attachmentApi.validate(params)

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