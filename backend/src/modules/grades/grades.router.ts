import { Router } from 'express'
import {authenticate} from "@/middleware/authenticate";
import {authorize} from "@/middleware/authorize";
import {validate} from "@/shared/utils/validate";
import {
    subSchoolQuerySchema
} from "@/modules/students/students.schema";
import {GradesController} from "@/modules/grades/grades.controller";
import {
    createGradeSchema,
    gradesParamsSchema,
    updateGradeSchema
} from "@/modules/grades/grades.schema";


const controller = new GradesController()

const router = Router()

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
    '/:id',
    authenticate,
    authorize('admin', 'director', 'teacher', 'parent', 'student', 'super_admin'),
    validate({
        params: gradesParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.getById,
);

router.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({
        body: createGradeSchema
    }),
    controller.create,
);
router.patch(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({
        params: gradesParamsSchema,
        query: subSchoolQuerySchema,
        body: updateGradeSchema,
    }),
    controller.update,
);
router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin', 'teacher'),
    validate({
        params: gradesParamsSchema,
        query: subSchoolQuerySchema
    }),
    controller.remove,
);

export { router as gradesRouter };
