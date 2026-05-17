import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as achievementController from '../controllers/achievement.controller';

const router = Router();

router.use(requireAuth);

router.get('/',        achievementController.listAchievements);
router.get('/recent',  achievementController.recentAchievements);

export default router;
