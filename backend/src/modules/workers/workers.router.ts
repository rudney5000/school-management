import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { WorkersController } from '@/modules/workers/workers.controller';
import {
  createWorkerSchema,
  workerParamsSchema,
  subSchoolQuerySchema,
  updateWorkerSchema,
} from '@/modules/workers/workers.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new WorkersController();

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
  authorize('admin', 'director'),
  validate({ params: workerParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createWorkerSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: workerParamsSchema,
    query: subSchoolQuerySchema,
    body: updateWorkerSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: workerParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

export { router as workersRouter };
