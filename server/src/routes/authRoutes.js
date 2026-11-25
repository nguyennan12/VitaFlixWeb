import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});

router.post('/google', authLimiter, authController.googleLogin);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
