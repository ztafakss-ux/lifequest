import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as svc from '../services/agenda.service';

export async function listEvents(req: AuthRequest, res: Response) {
  const events = await svc.listEvents(req.userId!, req.query as Record<string, string>);
  res.json({ events });
}

export async function upcomingEvents(req: AuthRequest, res: Response) {
  const events = await svc.getUpcoming(req.userId!);
  res.json({ events });
}

export async function getEvent(req: AuthRequest, res: Response) {
  const event = await svc.getEvent(req.userId!, req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
  return res.json({ event });
}

export async function createEvent(req: AuthRequest, res: Response) {
  const event = await svc.createEvent(req.userId!, req.body as Parameters<typeof svc.createEvent>[1]);
  res.status(201).json({ event });
}

export async function updateEvent(req: AuthRequest, res: Response) {
  const event = await svc.updateEvent(req.userId!, req.params.id, req.body as Record<string, unknown>);
  res.json({ event });
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  await svc.deleteEvent(req.userId!, req.params.id);
  res.json({ ok: true });
}
