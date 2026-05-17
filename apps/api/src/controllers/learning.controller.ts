import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as svc from '../services/learning.service';

const s = (i: { createdAt: Date; updatedAt: Date; startedAt?: Date | null; completedAt?: Date | null; [k: string]: unknown }) => ({
  ...i,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
  startedAt: i.startedAt?.toISOString() ?? null,
  completedAt: i.completedAt?.toISOString() ?? null,
});

export async function listLearning(req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await svc.listLearning(req.userId!);
    res.json({ items: items.map(s) });
  } catch { res.status(500).json({ error: 'Error al obtener ítems de aprendizaje.' }); }
}

export async function createLearning(req: AuthRequest, res: Response): Promise<void> {
  try {
    const item = await svc.createLearning(req.userId!, req.body);
    res.status(201).json({ item: s(item) });
  } catch { res.status(500).json({ error: 'Error al crear ítem.' }); }
}

export async function updateLearning(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await svc.updateLearning(req.userId!, req.params.id, req.body);
    res.json({ item: s(result.item), rewards: result.rewards });
  } catch { res.status(500).json({ error: 'Error al actualizar ítem.' }); }
}

export async function deleteLearning(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.deleteLearning(req.userId!, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar ítem.' }); }
}

export async function getLearningStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await svc.getLearningStats(req.userId!);
    res.json({ stats });
  } catch { res.status(500).json({ error: 'Error al obtener estadísticas.' }); }
}
