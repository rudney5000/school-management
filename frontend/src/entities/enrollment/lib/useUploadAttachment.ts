import {
    useCallback,
    useState
} from 'react'
import { handleApiError } from '@shared/lib'
import {
    type AttachableType,
    type AttachmentCategory,
    getImageDimensions,
    useConfirmAttachment,
    usePresignAttachment
} from "@entities/attachment";
import {
    isAllowedMimeType
} from "@entities/attachment/model/createAttachmentSchema";

interface UploadParams {
    file: File
    attachableType: AttachableType
    attachableId: string
    category: AttachmentCategory
}

export const useUploadAttachment = () => {
    const [isUploading, setIsUploading] = useState(false)
    const presign = usePresignAttachment()
    const confirm = useConfirmAttachment()

    const upload = useCallback(
        async ({ file, attachableType, attachableId, category }: UploadParams) => {
            setIsUploading(true)

            try {
                if (!isAllowedMimeType(file.type)) {
                    throw new Error("Type de fichier non autorisé")
                }

                const { width, height } = await getImageDimensions(file)

                const { uploadUrl, key } = await presign.mutateAsync({
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    attachableType,
                    attachableId,
                    category,
                })

                const putResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                })

                if (!putResponse.ok) {
                    throw new Error("Échec de l'upload du fichier")
                }

                return await confirm.mutateAsync({
                    attachableType,
                    attachableId,
                    category,
                    key,
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    width,
                    height,
                })
            } catch (err) {
                handleApiError(err instanceof Error ? err : new Error("Erreur lors de l'upload"))
                return null
            } finally {
                setIsUploading(false)
            }
        },
        [presign, confirm]
    )

    return { upload, isUploading }
}