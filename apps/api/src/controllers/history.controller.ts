import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as historyService from '../services/history.service';

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    toDate.setHours(23, 59, 59, 999);
    fromDate.setHours(0, 0, 0, 0);

    const data = await historyService.getHistorySummary(req.userId!, fromDate, toDate);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener historial.' });
  }
}

export async function getDayDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { date } = req.params;
    const data = await historyService.getDayDetail(req.userId!, date);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener detalle del día.' });
  }
}
