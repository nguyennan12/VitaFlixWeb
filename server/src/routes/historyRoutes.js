import { Router } from 'express';
import { historyController } from '../controllers/historyController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', historyController.getAll);
router.get('/:slug', historyController.getBySlug);
router.put('/', historyController.upsert);
router.delete('/:slug', historyController.removeOne);
router.delete('/', historyController.clearAll);

export default router;
