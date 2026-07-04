import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import {
    VideoCallsController
} from '@/modules/videoCalls/videoCalls.controller';
import {
    createSessionSchema,
    sessionParamsSchema,
    subSchoolQuerySchema,
} from '@/modules/videoCalls/videoCalls.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new VideoCallsController();

router.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        query: subSchoolQuerySchema,
        body: createSessionSchema,
    }),
    controller.create,
);

router.get(
    '/:sessionId',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        params: sessionParamsSchema,
    }),
    controller.getById,
);

router.post(
    '/:sessionId/join',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        params: sessionParamsSchema,
    }),
    controller.join,
);

router.post(
    '/:sessionId/leave',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        params: sessionParamsSchema,
    }),
    controller.leave,
);

router.post(
    '/:sessionId/end',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
    validate({
        params: sessionParamsSchema,
    }),
    controller.end,
);

export { router as videoCallsRouter };