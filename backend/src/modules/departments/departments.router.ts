import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { DepartmentsController } from '@/modules/departments/departments.controller';
import {
  createDepartmentSchema,
  departmentListQuerySchema,
  departmentParamsSchema,
  updateDepartmentSchema,
} from '@/modules/departments/departments.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new DepartmentsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  validate({ query: departmentListQuerySchema }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: departmentParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createDepartmentSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: departmentParamsSchema, body: updateDepartmentSchema }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: departmentParamsSchema }),
  controller.remove,
);

export { router as departmentsRouter };
