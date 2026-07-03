import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { CoursesController } from '@/modules/courses/courses.controller';
import {
  createCourseSchema,
  courseParamsSchema,
  subSchoolQuerySchema,
  updateCourseSchema,
} from '@/modules/courses/courses.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new CoursesController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
  validate({
      query: subSchoolQuerySchema
  }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
  validate({
      params: courseParamsSchema,
      query: subSchoolQuerySchema
  }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin'),
  validate({
      body: createCourseSchema
  }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin'),
  validate({
    params: courseParamsSchema,
    query: subSchoolQuerySchema,
    body: updateCourseSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin'),
  validate({ params: courseParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as coursesRouter };
