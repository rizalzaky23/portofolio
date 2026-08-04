import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimitAuth } from '../middleware/rateLimit.js';
import { loginSchema } from '../schemas/index.js';

const router = Router();

router.post('/login', rateLimitAuth, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);

export default router;
