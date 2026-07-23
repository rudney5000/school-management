import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {
    DocumentPdfController
} from '@/modules/document-pdf/document-pdf.controller';
import {
    bulletinPdfQuerySchema,
    enrollmentPdfQuerySchema,
    certificatePdfQuerySchema,
} from '@/modules/document-pdf/document-pdf.schema';

const router = Router();
const controller = new DocumentPdfController();

router.get(
    '/bulletin/pdf',
    authenticate,
    authorize('director', 'admin', 'teacher', 'student', 'parent', 'super_admin'),
    validate({ query: bulletinPdfQuerySchema }),
    controller.getBulletinPdf,
);

router.get(
    '/enrollment/pdf',
    authenticate,
    authorize('director', 'admin', 'student', 'parent', 'super_admin'),
    validate({ query: enrollmentPdfQuerySchema }),
    controller.getEnrollmentPdf,
);

router.get(
    '/certificate/pdf',
    authenticate,
    authorize('director', 'admin', 'student', 'parent', 'super_admin'),
    validate({ query: certificatePdfQuerySchema }),
    controller.getCertificatePdf,
);

export { router as documentPdfRouter };