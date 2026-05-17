import { Router } from 'express';
import { Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as searchService from '../services/search.service';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = String(req.query['q'] ?? '');
    const results = await searchService.globalSearch(req.userId!, q);
    res.json({ results, query: q });
  } catch {
    res.status(500).json({ error: 'Error en búsqueda.' });
  }
});

export default router;
