import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {
    batchSignBulletinSchema,
    bulletinSignSchema,
    bulletinStatusQuerySchema,
    certificateSignSchema,
    documentSignatureParamsSchema,
    enrollmentSignSchema,
    enrollmentStatusQuerySchema,
    revokeSignatureSchema
} from "@/modules/signature/document-signature.schema";
import {
    DocumentSignaturesController
} from "@/modules/signature/document-signature.controller";

const router = Router();
const controller = new DocumentSignaturesController();

router.post(
    '/bulletin',
    authenticate,
    authorize('teacher', 'director', 'admin', 'super_admin'),
    validate({
        body: bulletinSignSchema
    }),
    controller.signBulletin,
);

router.post(
    '/bulletin/batch',
    authenticate,
    authorize('director', 'admin', 'super_admin'),
    validate({
        body: batchSignBulletinSchema
    }),
    controller.signBulletinBatch,
);

router.get(
    '/bulletin/status',
    authenticate,
    authorize('director', 'admin', 'teacher', 'student', 'parent', 'super_admin'),
    validate({
        query: bulletinStatusQuerySchema
    }),
    controller.getBulletinStatus,
);

router.get(
    '/certificate/status',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher', 'parent', 'student'),
    validate({
        query: certificateSignSchema
    }),
    controller.getCertificateStatus,
)

router.post(
    '/enrollment',
    authenticate,
    authorize('director', 'admin', 'super_admin'),
    validate({
        body: enrollmentSignSchema
    }),
    controller.signEnrollment,
);
router.get(
    '/enrollment/status',
    authenticate,
    authorize('director', 'admin', 'super_admin'),
    validate({
        query: enrollmentStatusQuerySchema
    }),
    controller.getEnrollmentStatus,
);

router.post(
    '/certificate',
    authenticate,
    authorize('director', 'admin', 'super_admin'),
    validate({
        body: certificateSignSchema
    }),
    controller.signCertificate,
);

router.patch(
    '/:id/revoke',
    authenticate,
    authorize('director', 'admin', 'super_admin'),
    validate({
        params: documentSignatureParamsSchema,
        body: revokeSignatureSchema
    }),
    controller.revoke,
);

export { router as documentSignaturesRouter };