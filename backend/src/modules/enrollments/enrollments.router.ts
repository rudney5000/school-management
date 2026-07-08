import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { EnrollmentsController } from '@/modules/enrollments/enrollments.controller';
import {
  createEnrollmentSchema,
  enrollmentParamsSchema,
  enrollmentQuerySchema,
} from '@/modules/enrollments/enrollments.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new EnrollmentsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin', 'teacher', 'parent', 'student'),
    validate({ params: enrollmentQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin', 'teacher', 'parent', 'student'),
  validate({ params: enrollmentParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ body: createEnrollmentSchema }),
  controller.create,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ params: enrollmentParamsSchema }),
  controller.remove,
);

export { router as enrollmentsRouter };
