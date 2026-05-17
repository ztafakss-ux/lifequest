import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as svc from '../services/journal.service';

const s = (e: { createdAt: Date; updatedAt: Date; date: Date; [k: string]: unknown }) => ({
  ...e,
  date: e.date.toISOString(),
  createdAt: e.createdAt.toISOString(),
  updatedAt: e.updatedAt.toISOString(),
});

export async function listJournal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { month, tag, search } = req.query as Record<string, string>;
    const entries = await svc.listJournal(req.userId!, { month, tag, search });
    res.json({ entries: entries.map(s) });
  } catch { res.status(500).json({ error: 'Error al obtener entradas.' }); }
}

export async function getJournalEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const entry = await svc.getJournalEntry(req.userId!, req.params.id);
    if (!entry) { res.status(404).json({ error: 'No encontrado.' }); return; }
    res.json({ entry: s(entry) });
  } catch { res.status(500).json({ error: 'Error al obtener entrada.' }); }
}

export async function createJournalEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const entry = await svc.createJournalEntry(req.userId!, req.body);
    res.status(201).json({ entry: s(entry) });
  } catch { res.status(500).json({ error: 'Error al crear entrada.' }); }
}

export async function updateJournalEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    const entry = await svc.updateJournalEntry(req.userId!, req.params.id, req.body);
    res.json({ entry: s(entry) });
  } catch { res.status(500).json({ error: 'Error al actualizar entrada.' }); }
}

export async function deleteJournalEntry(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.deleteJournalEntry(req.userId!, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar entrada.' }); }
}

export async function getJournalStreak(req: AuthRequest, res: Response): Promise<void> {
  try {
    const streak = await svc.getJournalStreak(req.userId!);
    res.json({ streak });
  } catch { res.status(500).json({ error: 'Error al obtener racha.' }); }
}
