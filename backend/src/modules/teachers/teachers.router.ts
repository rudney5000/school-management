import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { TeachersController } from '@/modules/teachers/teachers.controller';
import {
    teacherParamsSchema,
    subSchoolQuerySchema,
    updateTeacherSchema,
    createTeacherWithAssignmentSchema,
    assignTeacherSchema,
    updateAssignmentSchema,
} from '@/modules/teachers/teachers.schema';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

const router = Router();
const controller = new TeachersController();

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
  authorize('admin', 'director', 'teacher'),
  validate({ params: teacherParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createTeacherWithAssignmentSchema  }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: teacherParamsSchema,
    query: subSchoolQuerySchema,
    body: updateTeacherSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: teacherParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

router.post('/:id/assign', authenticate, authorize('admin'),
    validate({ params: teacherParamsSchema, body: assignTeacherSchema }),
    controller.assign);

router.patch('/:id/assignment', authenticate, authorize('admin'),
    validate({ params: teacherParamsSchema, query: subSchoolQuerySchema, body: updateAssignmentSchema }),
    controller.updateAssignment);

export { router as teachersRouter };
