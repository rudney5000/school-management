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
  authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
  validate({
      query: subSchoolQuerySchema
  }),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'super_admin', 'student'),
  validate({
      params: teacherParamsSchema,
      query: subSchoolQuerySchema
  }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({
      body: createTeacherWithAssignmentSchema
  }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
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
  validate({
      params: teacherParamsSchema,
      query: subSchoolQuerySchema
  }),
  controller.remove,
);

router.post('/:id/assign',
    authenticate,
    authorize('admin', 'director', 'super_admin'),
    validate({
        params: teacherParamsSchema,
        body: assignTeacherSchema
    }),
    controller.assign);

router.patch('/:id/assignment',
    authenticate,
    authorize('admin', 'super_admin', 'director'),
    validate({
        params: teacherParamsSchema,
        query: subSchoolQuerySchema,
        body: updateAssignmentSchema
    }),
    controller.updateAssignment);

export { router as teachersRouter };
