import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as historyController from '../controllers/history.controller';

const router = Router();

router.use(requireAuth);

router.get('/',           historyController.getHistory);
router.get('/day/:date',  historyController.getDayDetail);

export default router;
