import type {
    Request,
    Response
} from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import type {
    BulletinPdfQueryDto,
    EnrollmentPdfQueryDto,
    CertificatePdfQueryDto,
} from '@/modules/document-pdf/document-pdf.schema';
import {
    DocumentPdfService
} from "@/modules/document-pdf/document-pdf.service";

function sendPdf(res: Response, buffer: Buffer, filename: string) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
}

export class DocumentPdfController {
    private readonly service = new DocumentPdfService();

    getBulletinPdf = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { locale, ...params } = req.query as unknown as BulletinPdfQueryDto;
        const buffer = await this.service.generate('bulletin', params, locale);
        sendPdf(res, buffer, 'bulletin.pdf');
    });

    getEnrollmentPdf = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { locale, ...params } = req.query as unknown as EnrollmentPdfQueryDto;
        const buffer = await this.service.generate('enrollment', params, locale);
        sendPdf(res, buffer, 'enrollment.pdf');
    });

    getCertificatePdf = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { locale, ...params } = req.query as unknown as CertificatePdfQueryDto;
        const buffer = await this.service.generate('certificate', params, locale);
        sendPdf(res, buffer, 'certificate.pdf');
    });
}