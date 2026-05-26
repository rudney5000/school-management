import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { CitiesController } from '@/modules/cities/cities.controller';
import {
  cityListQuerySchema,
  cityParamsSchema,
  createCitySchema,
  updateCitySchema,
} from '@/modules/cities/cities.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new CitiesController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  validate({ query: cityListQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: cityParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createCitySchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: cityParamsSchema, body: updateCitySchema }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: cityParamsSchema }),
  controller.remove,
);

export { router as citiesRouter };
