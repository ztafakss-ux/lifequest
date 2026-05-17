import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/sleep.controller';

const router = Router();
router.use(requireAuth);

router.get('/',          ctrl.listSleep);
router.post('/',         ctrl.createSleep);
router.patch('/:id',     ctrl.updateSleep);
router.delete('/:id',    ctrl.deleteSleep);
router.get('/stats',     ctrl.getSleepStats);

export default router;
