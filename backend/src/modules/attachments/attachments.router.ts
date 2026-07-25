import { Router } from 'express'
import { authenticate } from '@/middleware/authenticate'
import { authorize } from '@/middleware/authorize'
import { validate } from '@/shared/utils/validate'
import {
    AttachmentsController
} from "@/modules/attachments/attachments.controller";
import {
    attachmentParamsSchema,
    confirmUploadSchema,
    listAttachmentsQuerySchema,
    presignUploadSchema,
    rejectAttachmentSchema
} from "@/modules/attachments/attachments.schema";

const controller = new AttachmentsController()
const router = Router()

router.post(
    '/presign',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'worker', 'super_admin'),
    validate({
        body: presignUploadSchema
    }),
    controller.presign
)
router.post(
    '/confirm',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'worker', 'super_admin'),
    validate({
        body: confirmUploadSchema
    }),
    controller.confirm)
router.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'worker', 'super_admin'),
    validate({
        query: listAttachmentsQuerySchema
    }),
    controller.list)

router.patch(
    '/:id/validate',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: attachmentParamsSchema
    }),
    controller.validate,
)

router.patch(
    '/:id/reject',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: attachmentParamsSchema,
        body: rejectAttachmentSchema
    }),
    controller.reject,
)

export { router as attachmentsRouter }