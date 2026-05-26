import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { PaymentsController } from '@/modules/payments/payments.controller';
import {
  createPaymentSchema,
  paymentParamsSchema,
  updatePaymentSchema,
} from '@/modules/payments/payments.schema';
import { authenticate } from '@/middleware/authenticate.ts';
import { authorize } from '@/middleware/authorize.ts';

const router = Router();
const controller = new PaymentsController();

router.get(
  '/',
  authenticate,
  authorize('admin', 'director'),
  controller.getAll,
);
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'director', 'parent'),
  validate({ params: paymentParamsSchema }),
  controller.getById,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createPaymentSchema }),
  controller.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: paymentParamsSchema,
    body: updatePaymentSchema,
  }),
  controller.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: paymentParamsSchema }),
  controller.remove,
);

export { router as paymentsRouter };
