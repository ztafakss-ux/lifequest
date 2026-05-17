import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as stats from '../controllers/stats.controller';

const router = Router();
router.use(requireAuth);

router.get('/summary',       stats.summary);
router.get('/xp-history',    stats.xpHistory);
router.get('/radar',         stats.activityRadar);
router.get('/finance-trend', stats.financeTrend);
router.get('/heatmap',       stats.habitHeatmap);
router.get('/sleep',         stats.sleepScatter);
router.get('/gym',           stats.gymProgression);
router.get('/predictions',   stats.predictions);

export default router;
