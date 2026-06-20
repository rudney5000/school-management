import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { SubSchoolsController } from '@/modules/sub-schools/sub-schools.controller';
import {
  createSubSchoolSchema,
  subSchoolParamsSchema,
  schoolQuerySchema,
  updateSubSchoolSchema,
} from '@/modules/sub-schools/sub-schools.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new SubSchoolsController();

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'admin', 'director', 'worker', 'teacher', 'student', 'parent'),
  validate({
      query: schoolQuerySchema
  }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin', 'director', 'worker', 'teacher', 'student', 'parent'),
  validate({
      params: subSchoolParamsSchema,
      query: schoolQuerySchema
  }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({
      body: createSubSchoolSchema
  }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({
    params: subSchoolParamsSchema,
    query: schoolQuerySchema,
    body: updateSubSchoolSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({
      params: subSchoolParamsSchema,
      query: schoolQuerySchema
  }),
  controller.remove,
);

export { router as subSchoolsRouter };
