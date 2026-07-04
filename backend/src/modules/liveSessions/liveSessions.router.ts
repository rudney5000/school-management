import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import {
    LiveSessionsController
} from '@/modules/liveSessions/liveSessions.controller';
import {
    createLiveSessionSchema,
    liveSessionParamsSchema,
    subSchoolQuerySchema,
} from '@/modules/liveSessions/liveSessions.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new LiveSessionsController();

router.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        query: subSchoolQuerySchema
    }),
    controller.getAll,
);

router.get(
    '/:sessionId',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        params: liveSessionParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.getById,
);

router.post(
    '/',
    authenticate,
    authorize('teacher', 'admin', 'director', 'super_admin'),
    validate({
        query: subSchoolQuerySchema,
        body: createLiveSessionSchema
    }),
    controller.create,
);

router.post(
    '/:sessionId/start',
    authenticate,
    authorize('teacher', 'admin', 'director', 'super_admin'),
    validate({
        params: liveSessionParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.start,
);

router.post(
    '/:sessionId/end',
    authenticate,
    authorize('teacher', 'admin', 'director', 'super_admin'),
    validate({
        params: liveSessionParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.end,
);

router.post(
    '/:sessionId/join',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        params: liveSessionParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.join,
);

router.post(
    '/:sessionId/leave',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({
        params: liveSessionParamsSchema
    }),
    controller.leave,
);

export { router as liveSessionsRouter };