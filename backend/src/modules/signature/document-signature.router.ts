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
  paymentReceiptSignSchema,
  revokeSignatureSchema,
  teacherContractSignSchema,
} from '@/modules/signature/document-signature.schema';
import { DocumentSignaturesController } from '@/modules/signature/document-signature.controller';
import { restrictToOwnChild } from '@/middleware/restrict-to-own-child';

const router = Router();
const controller = new DocumentSignaturesController();

router.post(
  '/bulletin',
  authenticate,
  authorize('teacher', 'director', 'admin', 'super_admin'),
  validate({
    body: bulletinSignSchema,
  }),
  controller.signBulletin,
);

router.post(
  '/bulletin/batch',
  authenticate,
  authorize('director', 'admin', 'super_admin'),
  validate({
    body: batchSignBulletinSchema,
  }),
  controller.signBulletinBatch,
);

router.get(
  '/bulletin/status',
  authenticate,
  authorize('director', 'admin', 'teacher', 'student', 'parent', 'super_admin'),
  validate({
    query: bulletinStatusQuerySchema,
  }),
  restrictToOwnChild,
  controller.getBulletinStatus,
);

router.get(
  '/certificate/status',
  authenticate,
  authorize('admin', 'director', 'super_admin', 'teacher', 'parent', 'student'),
  validate({
    query: certificateSignSchema,
  }),
  restrictToOwnChild,
  controller.getCertificateStatus,
);

router.post(
  '/enrollment',
  authenticate,
  authorize('director', 'admin', 'super_admin'),
  validate({
    body: enrollmentSignSchema,
  }),
  controller.signEnrollment,
);
router.get(
  '/enrollment/status',
  authenticate,
  authorize('director', 'admin', 'super_admin'),
  validate({
    query: enrollmentStatusQuerySchema,
  }),
  restrictToOwnChild,
  controller.getEnrollmentStatus,
);

router.post(
  '/certificate',
  authenticate,
  authorize('director', 'admin', 'super_admin'),
  validate({
    body: certificateSignSchema,
  }),
  controller.signCertificate,
);

router.patch(
  '/:id/revoke',
  authenticate,
  authorize('director', 'admin', 'super_admin'),
  validate({
    params: documentSignatureParamsSchema,
    body: revokeSignatureSchema,
  }),
  controller.revoke,
);

router.post(
  '/teacher-contract',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
    body: teacherContractSignSchema,
  }),
  controller.signTeacherContract,
);

router.get(
  '/teacher-contract/status',
  authenticate,
  authorize('admin', 'director', 'super_admin', 'teacher'),
  validate({
    query: teacherContractSignSchema,
  }),
  controller.getTeacherContractStatus,
);

router.post(
  '/payment-receipt',
  authenticate,
  authorize('admin', 'director', 'worker'),
  validate({
    body: paymentReceiptSignSchema,
  }),
  controller.signPaymentReceipt,
);

router.get(
  '/payment-receipt/status',
  authenticate,
  authorize('admin', 'director', 'worker', 'parent'),
  validate({
    query: paymentReceiptSignSchema,
  }),
  restrictToOwnChild,
  controller.getPaymentReceiptStatus,
);

export { router as documentSignaturesRouter };
