import {
    useState,
    useCallback,
    useRef,
} from 'react'
import {
    attachmentApi
} from '@entities/attachment/api/attachment.api'
import { handleApiError } from '@shared/lib'
import { isSuccess } from '@shared/helperClass/CommonResponse'
import {
    getImageDimensions
} from '@entities/attachment/lib/getImageDimensions'
import type {
    Attachment
} from '@entities/attachment/model/types'
import type {
    AttachableType,
    AttachmentCategory,
} from '@entities/attachment/model/types'
import type {
    PresignUploadDto
} from '@entities/attachment/model/createAttachmentSchema'

type UploadAttachmentInput = {
    file:           File
    attachableType: AttachableType
    attachableId:   string
    category:       AttachmentCategory
}

class UploadCancelledError extends Error {
    constructor() {
        super('Upload annulé')
        this.name = 'UploadCancelledError'
    }
}

function putWithProgress(
    url: string,
    file: File,
    onProgress: (pct: number) => void,
    xhrRef: React.MutableRefObject<XMLHttpRequest | null>,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', file.type)

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
            }
        }

        xhr.onload = () => {
            xhrRef.current = null
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve()
            } else {
                reject(new Error(`Upload échoué (statut ${xhr.status})`))
            }
        }

        xhr.onerror = () => {
            xhrRef.current = null
            reject(new Error('Erreur réseau pendant l\'upload'))
        }

        xhr.onabort = () => {
            xhrRef.current = null
            reject(new UploadCancelledError())
        }

        xhr.send(file)
    })
}

export function useUploadAttachment() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const xhrRef = useRef<XMLHttpRequest | null>(null)

    const cancel = useCallback(() => {
        xhrRef.current?.abort()
    }, [])

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

            await putWithProgress(uploadUrl, file, setUploadProgress, xhrRef)

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
            if (!(err instanceof UploadCancelledError)) {
                handleApiError(err as Error)
            }
            return null
        } finally {
            setIsUploading(false)
        }
    }, [])

    return { upload, cancel, isUploading, uploadProgress }
}
