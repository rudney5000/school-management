import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import {createEventSchema, eventParamsSchema} from "@/modules/events/events.schema";
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import {EventsController} from "@/modules/events/events.controller";

const router = Router();
const controller = new EventsController();

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
  validate({ params: eventParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createEventSchema }),
  controller.create,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: eventParamsSchema }),
  controller.remove,
);

export { router as eventsRouter };
