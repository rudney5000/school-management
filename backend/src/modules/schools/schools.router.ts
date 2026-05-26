import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { SchoolsController } from '@/modules/schools/schools.controller';
import {
  createSchoolSchema,
  schoolParamsSchema,
  districtQuerySchema,
  updateSchoolSchema,
} from '@/modules/schools/schools.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new SchoolsController();

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({ query: districtQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin', 'director'),
  validate({ params: schoolParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({ body: createSchoolSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({
    params: schoolParamsSchema,
    body: updateSchoolSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate({ params: schoolParamsSchema }),
  controller.remove,
);

export { router as schoolsRouter };
