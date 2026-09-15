import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { AuthController } from './auth.controller';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema';

const router = Router();
const controller = new AuthController();

// Account creation is an administrative act, never self-service: the role is
// part of the payload, so a public endpoint here hands out admin accounts.
router.post(
  '/register',
  authenticate,
  authorize('super_admin', 'admin', 'director'),
  validate({ body: registerSchema }),
  controller.register,
);
router.post('/login', validate({ body: loginSchema }), controller.login);
router.post('/refresh', validate({ body: refreshSchema }), controller.refresh);
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);

export { router as authRouter };
