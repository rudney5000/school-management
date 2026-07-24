import {
    useState,
    useCallback,
} from 'react'
import { attachmentApi } from '@entities/attachment/api/attachment.api'
import { handleApiError } from '@shared/lib'
import { isSuccess } from '@shared/helperClass/CommonResponse'
import { getImageDimensions } from '@entities/attachment/lib/getImageDimensions'
import type { Attachment } from '@entities/attachment/model/types'
import type {
    AttachableType,
    AttachmentCategory,
} from '@entities/attachment/model/types'
import type { PresignUploadDto } from '@entities/attachment/model/createAttachmentSchema'

type UploadAttachmentInput = {
    file:           File
    attachableType: AttachableType
    attachableId:   string
    category:       AttachmentCategory
}

export function useUploadAttachment() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const upload = useCallback(async (input: UploadAttachmentInput): Promise<Attachment | null> => {
        const { file, attachableType, attachableId, category } = input

        setIsUploading(true)
        setUploadProgress(0)

        try {
            const presignRes = await attachmentApi.presign({
                filename:       file.name,
                mimeType:       file.type as PresignUploadDto['mimeType'],
                size:           file.size,
                attachableType,
                attachableId,
                category,
            })

            if (!isSuccess(presignRes)) {
                throw new Error('Échec de la préparation de l\'upload')
            }

            const { uploadUrl, key } = presignRes.result

            await fetch(uploadUrl, {
                method:  'PUT',
                body:    file,
                headers: { 'Content-Type': file.type },
            })

            setUploadProgress(100)

            const isImage = file.type.startsWith('image/')
            const dimensions = isImage
                ? await getImageDimensions(file)
                : { width: 1, height: 1 }

            const confirmRes = await attachmentApi.confirm({
                attachableType,
                attachableId,
                category,
                key,
                filename: file.name,
                mimeType: file.type,
                size:     file.size,
                width:    dimensions.width,
                height:   dimensions.height,
            })

            if (!isSuccess(confirmRes)) {
                throw new Error('Échec de la confirmation de l\'upload')
            }

            return confirmRes.result
        } catch (err) {
            handleApiError(err as Error)
            return null
        } finally {
            setIsUploading(false)
        }
    }, [])

    return { upload, isUploading, uploadProgress }
}
