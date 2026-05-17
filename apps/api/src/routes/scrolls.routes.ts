import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import * as scrolls from '../services/scrolls.service';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const data = await scrolls.getUnreadScrolls((req as AuthRequest).userId!);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/generate', async (req, res, next) => {
  try {
    await scrolls.generateDailyScroll((req as AuthRequest).userId!);
    const data = await scrolls.getUnreadScrolls((req as AuthRequest).userId!);
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await scrolls.markScrollRead((req as AuthRequest).userId!, req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/read-all', async (req, res, next) => {
  try {
    await scrolls.markAllRead((req as AuthRequest).userId!);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
