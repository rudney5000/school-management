import { Router } from 'express'
import { authenticate } from '@/middleware/authenticate'
import { authorize } from '@/middleware/authorize'
import { validate } from '@/shared/utils/validate'
import {
    AttachmentsController
} from "@/modules/attachments/attachments.controller";
import {
    confirmUploadSchema,
    listAttachmentsQuerySchema,
    presignUploadSchema
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

export { router as attachmentsRouter }