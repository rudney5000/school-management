import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {
    ReportsController
} from '@/modules/reports/reports.controller';
import {
    assignReportSchema,
    createReportSchema,
    reportFiltersSchema,
    reportParamsSchema,
    trackReportParamsSchema,
    updateReportStatusSchema,
} from '@/modules/reports/reports.schema';

const router = Router();
const controller = new ReportsController();

router.post(
    '/',
    authenticate,
    authorize('student', 'parent', 'teacher'),
    validate({
        body: createReportSchema
    }),
    controller.create,
);

router.get(
    '/me',
    authenticate,
    controller.myReports
);

router.get(
    '/track/:token',
    validate({
        params: trackReportParamsSchema
    }),
    controller.trackByToken,
);

router.get(
    '/',
    authenticate,
    authorize('admin', 'super_admin', 'director'),
    validate({
        query: reportFiltersSchema
    }),
    controller.getAll,
);

router.get(
    '/:id',
    authenticate,
    authorize('admin', 'super_admin', 'director'),
    validate({
        params: reportParamsSchema
    }),
    controller.getById,
);

router.patch(
    '/:id/status',
    authenticate,
    authorize('admin', 'super_admin', 'director'),
    validate({
        params: reportParamsSchema,
        body: updateReportStatusSchema
    }),
    controller.updateStatus,
);

router.patch(
    '/:id/assign',
    authenticate,
    authorize('admin', 'super_admin', 'director'),
    validate({
        params: reportParamsSchema,
        body: assignReportSchema
    }),
    controller.assign,
);

export { router as reportsRouter };