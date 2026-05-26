import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { TeachersController } from '@/modules/teachers/teachers.controller';
import {
  createTeacherSchema,
  teacherParamsSchema,
  schoolQuerySchema,
  updateTeacherSchema,
} from '@/modules/teachers/teachers.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new TeachersController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  validate({ query: schoolQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher'),
  validate({ params: teacherParamsSchema, query: schoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createTeacherSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: teacherParamsSchema,
    query: schoolQuerySchema,
    body: updateTeacherSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: teacherParamsSchema, query: schoolQuerySchema }),
  controller.remove,
);

export { router as teachersRouter };
