import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import {
    createEventSchema,
    eventParamsSchema
} from "@/modules/events/events.schema";
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {EventsController} from "@/modules/events/events.controller";

const router = Router();
const controller = new EventsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director', 'student', 'parent', 'super_admin', 'teacher'),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'teacher', 'parent', 'student', 'super_admin'),
  validate({ params: eventParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ body: createEventSchema }),
  controller.create,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'super_admin'),
  validate({ params: eventParamsSchema }),
  controller.remove,
);

export { router as eventsRouter };
