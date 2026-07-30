import { ApiWrapper } from '@shared/api/ApiWrapper'
import { baseApi } from '@shared/api/instance'
import type {
    DocumentSignature,
    SignatureStatusResult,
} from '@entities/document-signature/model/types'
import type {
    DocumentSignatureParamsDto
} from '@entities/document-signature/model/dto'
import type {
    BatchSignBulletinDto,
    BulletinPdfQueryDto,
    BulletinSignDto,
    CertificatePdfQueryDto,
    CertificateSignDto,
    EnrollmentPdfQueryDto,
    EnrollmentSignDto,
    PaymentReceiptPdfQueryDto,
    PaymentReceiptSignDto,
    RevokeSignatureDto,
    TeacherContractPdfQueryDto,
    TeacherContractSignDto,
} from '@entities/document-signature/model/createDocumentSignatureSchema'

export interface BatchSignBulletinResult {
    studentId?: string
    success: boolean
    error?: string
}

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

    signBulletinBatch(payload: BatchSignBulletinDto) {
        return this.handleRequest<BatchSignBulletinResult[]>(
            this._baseApi.post('/document-signatures/bulletin/batch', payload),
            (raw) => raw as BatchSignBulletinResult[],
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

    getCertificateStatus(params: CertificateSignDto) {
        return this.handleRequest<SignatureStatusResult>(
            this._baseApi.get('/document-signatures/certificate/status', params),
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

    signTeacherContract(payload: TeacherContractSignDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.post('/document-signatures/teacher-contract', payload),
            (raw) => raw as DocumentSignature,
        )
    }

    getTeacherContractStatus(params: TeacherContractSignDto) {
        return this.handleRequest<SignatureStatusResult>(
            this._baseApi.get('/document-signatures/teacher-contract/status', params),
            (raw) => raw as SignatureStatusResult,
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

    async downloadTeacherContractPdf(params: TeacherContractPdfQueryDto): Promise<Blob> {
        const response = await this._baseApi.axiosInstance.get('/document-pdf/teacher-contract/pdf', {
            params,
            responseType: 'blob',
        })
        return response.data as Blob
    }

    signPaymentReceipt(payload: PaymentReceiptSignDto) {
        return this.handleRequest<DocumentSignature>(
            this._baseApi.post('/document-signatures/payment-receipt', payload),
            (raw) => raw as DocumentSignature,
        )
    }

    getPaymentReceiptStatus(params: PaymentReceiptSignDto) {
        return this.handleRequest<SignatureStatusResult>(
            this._baseApi.get('/document-signatures/payment-receipt/status', params),
            (raw) => raw as SignatureStatusResult,
        )
    }

    async downloadPaymentReceiptPdf(params: PaymentReceiptPdfQueryDto): Promise<Blob> {
        const response = await this._baseApi.axiosInstance.get('/document-pdf/payment-receipt/pdf', {
            params,
            responseType: 'blob',
        })
        return response.data as Blob
    }
}

export const documentSignatureApi = new DocumentSignatureApi()
