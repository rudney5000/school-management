import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import {
    subSchoolQuerySchema,
} from '@/modules/students/students.schema';
import {authenticate} from "@/middleware/authenticate";
import {authorize} from "@/middleware/authorize";
import {
    AcademicPeriodsController
} from "@/modules/academic-periods/academic-periods.controller";
import {
    academicPeriodsParamsSchema,
    createAcademicPeriodSchema,
    updateAcademicPeriodSchema
} from "@/modules/academic-periods/academic-periods.schema";

const router = Router({ mergeParams: true })
const controller = new AcademicPeriodsController()

router.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'student', 'super_admin'),
    validate({ query: subSchoolQuerySchema }),
    controller.getAll,
);

router.get(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'parent', 'student', 'super_admin'),
    validate({
        params: academicPeriodsParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.getById,
);

router.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({ body: createAcademicPeriodSchema }),
    controller.create,
);

router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: academicPeriodsParamsSchema,
        query: subSchoolQuerySchema,
        body: updateAcademicPeriodSchema,
    }),
    controller.update,
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: academicPeriodsParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.remove,
);

export { router as academicPeriodsRouter };
