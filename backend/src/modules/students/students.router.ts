import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { StudentsController } from '@/modules/students/students.controller';
import {
  createStudentSchema,
  studentParamsSchema,
  subSchoolQuerySchema,
  updateStudentSchema,
} from '@/modules/students/students.schema';
import {authenticate} from "@/middleware/authenticate.ts";
import {authorize} from "@/middleware/authorize.ts";

const router = Router();
const controller = new StudentsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  validate({ query: subSchoolQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: studentParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createStudentSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
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
  authorize('admin'),
  validate({ params: studentParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as studentsRouter };
