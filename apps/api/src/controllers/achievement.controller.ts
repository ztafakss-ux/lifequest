import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as achievementService from '../services/achievement.service';

export async function listAchievements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const achievements = await achievementService.getUserAchievements(req.userId!);
    res.json({ achievements });
  } catch {
    res.status(500).json({ error: 'Error al obtener logros.' });
  }
}

export async function recentAchievements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const recent = await achievementService.getRecentAchievements(req.userId!);
    res.json({
      recent: recent.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener logros recientes.' });
  }
}
