import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as svc from '../services/meal.service';

const s = (m: { createdAt: Date; date: Date; [k: string]: unknown }) => ({
  ...m,
  date: m.date.toISOString(),
  createdAt: m.createdAt.toISOString(),
});

export async function listMeals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const meals = await svc.listMeals(req.userId!, req.query.date as string);
    res.json({ meals: meals.map(s) });
  } catch { res.status(500).json({ error: 'Error al obtener comidas.' }); }
}

export async function createMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const meal = await svc.createMeal(req.userId!, req.body);
    res.status(201).json({ meal: s(meal) });
  } catch { res.status(500).json({ error: 'Error al registrar comida.' }); }
}

export async function deleteMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.deleteMeal(req.userId!, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar comida.' }); }
}

export async function getMealSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const now = new Date();
    const { from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to = now.toISOString() } = req.query as Record<string, string>;
    const summary = await svc.getMealSummary(req.userId!, from, to);
    res.json(summary);
  } catch { res.status(500).json({ error: 'Error al obtener resumen.' }); }
}
