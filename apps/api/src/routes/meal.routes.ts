import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/meal.controller';

const router = Router();
router.use(requireAuth);

router.get('/',          ctrl.listMeals);
router.post('/',         ctrl.createMeal);
router.delete('/:id',    ctrl.deleteMeal);
router.get('/summary',   ctrl.getMealSummary);

export default router;
