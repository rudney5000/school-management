import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { SchedulesController } from '@/modules/schedules/schedules.controller';
import {
  createScheduleSchema,
  scheduleParamsSchema,
  updateScheduleSchema,
} from '@/modules/schedules/schedules.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new SchedulesController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent'),
  validate({ params: scheduleParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createScheduleSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: scheduleParamsSchema,
    body: updateScheduleSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: scheduleParamsSchema }),
  controller.remove,
);

export { router as schedulesRouter };
