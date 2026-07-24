import { useMutation } from '@tanstack/react-query'
import { handleApiError } from '@shared/lib'
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api'
import type { CertificateSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema'

export const useSignCertificate = () => {
    return useMutation({
        mutationFn: (dto: CertificateSignDto) => documentSignatureApi.signCertificate(dto),
        onError: (error: Error) => {
            handleApiError(error)
        },
    })
}
