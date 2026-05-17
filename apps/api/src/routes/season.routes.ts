import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';
import type { Response } from 'express';
import { getSeasonForUser, getActiveSeason } from '../services/season.service';

const router = Router();
router.use(requireAuth);

router.get('/active', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getSeasonForUser(req.userId!);
    res.json(data);
  } catch (error) {
    console.error('[Season] active error:', error);
    res.status(500).json({ error: 'season_error' });
  }
});

router.get('/leaderboard', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const season = await getActiveSeason();
    if (!season) { res.json({ leaderboard: [] }); return; }
    res.json({ leaderboard: season.participants });
  } catch (error) {
    console.error('[Season] leaderboard error:', error);
    res.status(500).json({ error: 'season_error' });
  }
});

export default router;
