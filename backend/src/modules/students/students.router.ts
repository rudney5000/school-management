import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { StudentsController } from '@/modules/students/students.controller';
import {
  createStudentSchema,
  studentParamsSchema,
  subSchoolQuerySchema,
  updateStudentSchema,
} from '@/modules/students/students.schema';
import {authenticate} from "@/middleware/authenticate";
import {authorize} from "@/middleware/authorize";

const router = Router();
const controller = new StudentsController();

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
  validate({ params: studentParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);

router.get(
    '/unassigned',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({ query: subSchoolQuerySchema }),
    controller.getUnassigned,
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ body: createStudentSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
    params: studentParamsSchema,
    query: subSchoolQuerySchema,
    body: updateStudentSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ params: studentParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as studentsRouter };
