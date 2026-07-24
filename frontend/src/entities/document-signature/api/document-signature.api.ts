import { ApiWrapper } from '@shared/api/ApiWrapper'
import { baseApi } from '@shared/api/instance'
import type {
    DocumentSignature,
    SignatureStatusResult,
} from '@entities/document-signature/model/types'
import type { DocumentSignatureParamsDto } from '@entities/document-signature/model/dto'
import type {
    BulletinPdfQueryDto,
    BulletinSignDto,
    CertificatePdfQueryDto,
    CertificateSignDto,
    EnrollmentPdfQueryDto,
    EnrollmentSignDto,
    RevokeSignatureDto,
} from '@entities/document-signature/model/createDocumentSignatureSchema'

export class DocumentSignatureApi extends ApiWrapper {
    constructor() {
        super(baseApi)
    }

    signBulletin(payload: BulletinSignDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.post('/document-signatures/bulletin', payload),
            (raw) => raw as DocumentSignature,
        )
    }

    getBulletinStatus(params: BulletinSignDto) {
        return this.handleRequest<SignatureStatusResult>(
            this._baseApi.get('/document-signatures/bulletin/status', params),
            (raw) => raw as SignatureStatusResult,
        )
    }

    signEnrollment(payload: EnrollmentSignDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.post('/document-signatures/enrollment', payload),
            (raw) => raw as DocumentSignature,
        )
    }

    getEnrollmentStatus(params: EnrollmentSignDto) {
        return this.handleRequest<SignatureStatusResult>(
            this._baseApi.get('/document-signatures/enrollment/status', params),
            (raw) => raw as SignatureStatusResult,
        )
    }

    signCertificate(payload: CertificateSignDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.post('/document-signatures/certificate', payload),
            (raw) => raw as DocumentSignature,
        )
    }

    revoke(params: DocumentSignatureParamsDto, payload: RevokeSignatureDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.patch(`/document-signatures/${params.id}/revoke`, payload),
            (raw) => raw as DocumentSignature,
        )
    }

    async downloadBulletinPdf(params: BulletinPdfQueryDto): Promise<Blob> {
        const response = await this._baseApi.axiosInstance.get('/document-pdf/bulletin/pdf', {
            params,
            responseType: 'blob',
        })
        return response.data as Blob
    }

    async downloadEnrollmentPdf(params: EnrollmentPdfQueryDto): Promise<Blob> {
        const response = await this._baseApi.axiosInstance.get('/document-pdf/enrollment/pdf', {
            params,
            responseType: 'blob',
        })
        return response.data as Blob
    }

    async downloadCertificatePdf(params: CertificatePdfQueryDto): Promise<Blob> {
        const response = await this._baseApi.axiosInstance.get('/document-pdf/certificate/pdf', {
            params,
            responseType: 'blob',
        })
        return response.data as Blob
    }
}

export const documentSignatureApi = new DocumentSignatureApi()
