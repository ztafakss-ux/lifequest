import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/agenda.controller';

const router = Router();
router.use(requireAuth);

router.get('/upcoming', ctrl.upcomingEvents);
router.get('/',         ctrl.listEvents);
router.post('/',        ctrl.createEvent);
router.get('/:id',      ctrl.getEvent);
router.patch('/:id',    ctrl.updateEvent);
router.delete('/:id',   ctrl.deleteEvent);

export default router;
