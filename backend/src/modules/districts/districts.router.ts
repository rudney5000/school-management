import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { DistrictsController } from '@/modules/districts/districts.controller';
import {
  createDistrictSchema,
  districtListQuerySchema,
  districtParamsSchema,
  updateDistrictSchema,
} from '@/modules/districts/districts.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new DistrictsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  validate({ query: districtListQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: districtParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createDistrictSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: districtParamsSchema, body: updateDistrictSchema }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: districtParamsSchema }),
  controller.remove,
);

export { router as districtsRouter };
