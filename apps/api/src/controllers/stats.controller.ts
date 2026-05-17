import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as stats from '../services/stats.service';

export async function summary(req: AuthRequest, res: Response): Promise<void> {
  const period = (req.query.period as string) ?? 'month';
  res.json(await stats.getStatsSummary(req.userId!, period));
}

export async function xpHistory(req: AuthRequest, res: Response): Promise<void> {
  const period = (req.query.period as string) ?? 'month';
  res.json(await stats.getXpHistory(req.userId!, period));
}

export async function activityRadar(req: AuthRequest, res: Response): Promise<void> {
  res.json(await stats.getActivityRadar(req.userId!));
}

export async function financeTrend(req: AuthRequest, res: Response): Promise<void> {
  res.json(await stats.getFinanceTrend(req.userId!));
}

export async function habitHeatmap(req: AuthRequest, res: Response): Promise<void> {
  res.json(await stats.getHabitHeatmap(req.userId!));
}

export async function sleepScatter(req: AuthRequest, res: Response): Promise<void> {
  const period = (req.query.period as string) ?? 'month';
  res.json(await stats.getSleepScatter(req.userId!, period));
}

export async function gymProgression(req: AuthRequest, res: Response): Promise<void> {
  const period = (req.query.period as string) ?? 'month';
  res.json(await stats.getGymProgression(req.userId!, period));
}

export async function predictions(req: AuthRequest, res: Response): Promise<void> {
  res.json(await stats.getPredictions(req.userId!));
}
