import { Router } from 'express';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { validate } from '@/shared/utils/validate';
import { CurriculaController } from './curricula.controller';
import {
  confirmCurriculumFileSchema,
  createCurriculumSchema,
  curriculumAttachmentParamsSchema,
  curriculumParamsSchema,
  listCurriculaQuerySchema,
  presignCurriculumFileSchema,
  subSchoolQuerySchema,
  updateCurriculumSchema,
} from './curricula.schema';

const router = Router();
const controller = new CurriculaController();

const MANAGERS = ['admin', 'director', 'super_admin'] as const;
const READERS = [...MANAGERS, 'teacher', 'parent', 'student'] as const;

// Reads: what each role sees is narrowed in the service (drafts, classes).
router.get(
  '/',
  authenticate,
  authorize(...READERS),
  validate({ query: listCurriculaQuerySchema }),
  controller.list,
);

router.get(
  '/:id',
  authenticate,
  authorize(...READERS),
  validate({ params: curriculumParamsSchema, query: subSchoolQuerySchema }),
  controller.getById,
);

router.get(
  '/:id/files/:attachmentId/download',
  authenticate,
  authorize(...READERS),
  validate({ params: curriculumAttachmentParamsSchema, query: subSchoolQuerySchema }),
  controller.download,
);

// Writes: the school's management only.
router.post(
  '/',
  authenticate,
  authorize(...MANAGERS),
  validate({ query: subSchoolQuerySchema, body: createCurriculumSchema }),
  controller.create,
);

router.patch(
  '/:id',
  authenticate,
  authorize(...MANAGERS),
  validate({
    params: curriculumParamsSchema,
    query: subSchoolQuerySchema,
    body: updateCurriculumSchema,
  }),
  controller.update,
);

router.post(
  '/:id/publish',
  authenticate,
  authorize(...MANAGERS),
  validate({ params: curriculumParamsSchema, query: subSchoolQuerySchema }),
  controller.publish,
);

router.post(
  '/:id/unpublish',
  authenticate,
  authorize(...MANAGERS),
  validate({ params: curriculumParamsSchema, query: subSchoolQuerySchema }),
  controller.unpublish,
);

router.delete(
  '/:id',
  authenticate,
  authorize(...MANAGERS),
  validate({ params: curriculumParamsSchema, query: subSchoolQuerySchema }),
  controller.remove,
);

router.post(
  '/:id/files/presign',
  authenticate,
  authorize(...MANAGERS),
  validate({
    params: curriculumParamsSchema,
    query: subSchoolQuerySchema,
    body: presignCurriculumFileSchema,
  }),
  controller.presignFile,
);

router.post(
  '/:id/files',
  authenticate,
  authorize(...MANAGERS),
  validate({
    params: curriculumParamsSchema,
    query: subSchoolQuerySchema,
    body: confirmCurriculumFileSchema,
  }),
  controller.confirmFile,
);

router.delete(
  '/:id/files/:attachmentId',
  authenticate,
  authorize(...MANAGERS),
  validate({ params: curriculumAttachmentParamsSchema, query: subSchoolQuerySchema }),
  controller.removeFile,
);

export { router as curriculaRouter };
