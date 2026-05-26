import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { CountriesController } from '@/modules/countries/countries.controller';
import {
  countryParamsSchema,
  createCountrySchema,
  updateCountrySchema,
} from '@/modules/countries/countries.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new CountriesController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: countryParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createCountrySchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: countryParamsSchema, body: updateCountrySchema }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: countryParamsSchema }),
  controller.remove,
);

export { router as countriesRouter };
