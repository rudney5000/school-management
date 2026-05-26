import { Router } from 'express';
import { validate } from '@/shared/utils/validate';
import { authenticate } from '@/middleware/authenticate';
import { AuthController } from './auth.controller';
import {loginSchema, refreshSchema, registerSchema} from './auth.schema';

const router = Router();
const controller = new AuthController();

router.post('/register', validate({ body: registerSchema }), controller.register);
router.post('/login',   validate({ body: loginSchema }), controller.login);
router.post('/refresh', validate({ body: refreshSchema }), controller.refresh);
router.get('/me',       authenticate, controller.me);
router.post('/logout',  authenticate, controller.logout);

export { router as authRouter };