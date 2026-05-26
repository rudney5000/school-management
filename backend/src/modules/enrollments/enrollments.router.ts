import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { EnrollmentsController } from '@/modules/enrollments/enrollments.controller';
import {
  createEnrollmentSchema,
  enrollmentParamsSchema,
} from '@/modules/enrollments/enrollments.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new EnrollmentsController();

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
  validate({ params: enrollmentParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createEnrollmentSchema }),
  controller.create,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: enrollmentParamsSchema }),
  controller.remove,
);

export { router as enrollmentsRouter };
