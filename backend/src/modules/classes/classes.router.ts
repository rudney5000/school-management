import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { ClassesController } from '@/modules/classes/classes.controller';
import {
    createClassSchema,
    classParamsSchema,
    subSchoolQuerySchema,
    updateClassSchema,
    classCourseQuerySchema,
    createClassCourseSchema,
    classCourseParamsSchema,
} from '@/modules/classes/classes.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new ClassesController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin', 'student', 'parent'),
  validate({
      query: subSchoolQuerySchema
  }),
  controller.getAll,
);

router.get(
    '/',
    authenticate,
    authorize('admin', 'director', 'teacher', 'super_admin'),
    validate({
        query: classCourseQuerySchema
    }),
    controller.getByClass,
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent', 'student', 'super_admin'),
  validate({
      params: classParamsSchema,
      query: subSchoolQuerySchema
  }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
      body: createClassSchema
  }),
  controller.create,
);

router.post(
    '/',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        body: createClassCourseSchema
    }),
    controller.createClassCourse,
);


router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
    params: classParamsSchema,
    query: subSchoolQuerySchema,
    body: updateClassSchema,
  }),
  controller.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
      params: classParamsSchema,
      query: subSchoolQuerySchema
  }),
  controller.remove,
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: classCourseParamsSchema
    }),
    controller.removeClassCourse,
);

export { router as classesRouter };
