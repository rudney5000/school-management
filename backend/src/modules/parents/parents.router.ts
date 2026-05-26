import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { ParentsController } from '@/modules/parents/parents.controller';
import {
  createParentSchema,
  parentParamsSchema,
  subSchoolQuerySchema,
  updateParentSchema,
} from '@/modules/parents/parents.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new ParentsController();

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
  authorize('admin', 'director', 'parent'),
  validate({ params: parentParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createParentSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: parentParamsSchema,
    query: subSchoolQuerySchema,
    body: updateParentSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: parentParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as parentsRouter };
