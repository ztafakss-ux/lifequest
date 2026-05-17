import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/journal.controller';

const router = Router();
router.use(requireAuth);

router.get('/',         ctrl.listJournal);
router.post('/',        ctrl.createJournalEntry);
router.get('/streak',   ctrl.getJournalStreak);
router.get('/:id',      ctrl.getJournalEntry);
router.patch('/:id',    ctrl.updateJournalEntry);
router.delete('/:id',   ctrl.deleteJournalEntry);

export default router;
