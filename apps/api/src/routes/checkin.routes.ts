import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware';
import * as checkin from '../services/checkin.service';

const router = Router();
router.use(requireAuth);

router.get('/today', async (req, res, next) => {
  try {
    const data = await checkin.getTodayCheckin((req as AuthRequest).userId!);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { mood, energy, note } = req.body;
    const data = await checkin.upsertCheckin((req as AuthRequest).userId!, mood, energy, note);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/history', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const data = await checkin.getCheckinHistory((req as AuthRequest).userId!, days);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const data = await checkin.getCheckinStats((req as AuthRequest).userId!);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
