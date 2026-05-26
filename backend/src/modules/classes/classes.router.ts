import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { ClassesController } from '@/modules/classes/classes.controller';
import {
  createClassSchema,
  classParamsSchema,
  subSchoolQuerySchema,
  updateClassSchema,
} from '@/modules/classes/classes.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new ClassesController();

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
  validate({ params: classParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createClassSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
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
  authorize('admin'),
  validate({ params: classParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as classesRouter };
