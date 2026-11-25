import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', favoriteController.getAll);
router.post('/toggle', favoriteController.toggle);

export default router;
