import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as questService from '../services/quest.service';

function serializeQuest(q: {
  deadline: Date | null;
  completedAt: Date | null;
  lastResetAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}) {
  return {
    ...q,
    deadline: q.deadline?.toISOString() ?? null,
    completedAt: q.completedAt?.toISOString() ?? null,
    lastResetAt: q.lastResetAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

export async function createQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quest = await questService.createQuest(req.userId!, req.body);
    res.status(201).json({ quest: serializeQuest(quest) });
  } catch {
    res.status(500).json({ error: 'Error al crear la misión.' });
  }
}

export async function listQuests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, status, category, difficulty, search, sortBy } = req.query as Record<string, string>;
    const quests = await questService.listQuests(req.userId!, {
      type: type as never,
      status: status as never,
      category: category as never,
      difficulty: difficulty as never,
      search,
      sortBy: sortBy as never,
    });
    res.json({ quests: quests.map(serializeQuest) });
  } catch {
    res.status(500).json({ error: 'Error al obtener misiones.' });
  }
}

export async function getQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quest = await questService.getQuestById(req.userId!, req.params.id);
    if (!quest) { res.status(404).json({ error: 'Misión no encontrada.' }); return; }
    res.json({ quest: serializeQuest(quest) });
  } catch {
    res.status(500).json({ error: 'Error al obtener la misión.' });
  }
}

export async function updateQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quest = await questService.updateQuest(req.userId!, req.params.id, req.body);
    res.json({ quest: serializeQuest(quest) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'QUEST_NOT_FOUND') { res.status(404).json({ error: 'Misión no encontrada.' }); return; }
    res.status(500).json({ error: 'Error al actualizar la misión.' });
  }
}

export async function archiveQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quest = await questService.archiveQuest(req.userId!, req.params.id);
    res.json({ quest: serializeQuest(quest) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'QUEST_NOT_FOUND') { res.status(404).json({ error: 'Misión no encontrada.' }); return; }
    res.status(500).json({ error: 'Error al archivar la misión.' });
  }
}

export async function failQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const quest = await questService.failQuest(req.userId!, req.params.id);
    res.json({ quest: serializeQuest(quest) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'QUEST_NOT_FOUND') { res.status(404).json({ error: 'Misión no encontrada o ya no activa.' }); return; }
    res.status(500).json({ error: 'Error al marcar misión como fallida.' });
  }
}

export async function completeQuest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await questService.completeQuest(req.userId!, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'QUEST_NOT_FOUND') {
      res.status(404).json({ error: 'Misión no encontrada o ya completada.' });
    } else {
      res.status(500).json({ error: 'Error al completar la misión.' });
    }
  }
}

export async function toggleSubObjective(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { subObjectiveId, completed } = req.body;
    const quest = await questService.toggleSubObjective(req.userId!, req.params.id, subObjectiveId, completed);
    res.json({ quest: serializeQuest(quest) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'QUEST_NOT_FOUND') { res.status(404).json({ error: 'Misión no encontrada.' }); return; }
    res.status(500).json({ error: 'Error al actualizar sub-objetivo.' });
  }
}
