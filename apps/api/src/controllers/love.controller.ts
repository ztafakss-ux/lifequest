import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as svc from '../services/love.service';

const s = (r: { createdAt: Date; updatedAt: Date; [k: string]: unknown }) => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export async function listRelationships(req: AuthRequest, res: Response): Promise<void> {
  try {
    const relationships = await svc.listRelationships(req.userId!);
    res.json({ relationships: relationships.map(s) });
  } catch { res.status(500).json({ error: 'Error al obtener relaciones.' }); }
}

export async function createRelationship(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await svc.createRelationship(req.userId!, req.body);
    res.status(201).json({ relationship: s(r) });
  } catch { res.status(500).json({ error: 'Error al crear relación.' }); }
}

export async function updateRelationship(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await svc.updateRelationship(req.userId!, req.params.id, req.body);
    res.json({ relationship: s(r) });
  } catch { res.status(500).json({ error: 'Error al actualizar relación.' }); }
}

export async function deleteRelationship(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.deleteRelationship(req.userId!, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar relación.' }); }
}

export async function getImportantDates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const dates = await svc.getImportantDates(req.userId!, req.params.id);
    res.json({ dates });
  } catch { res.status(500).json({ error: 'Error al obtener fechas.' }); }
}

export async function addImportantDate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await svc.addImportantDate(req.userId!, req.params.id, req.body);
    res.status(201).json({ relationship: s(r) });
  } catch { res.status(500).json({ error: 'Error al agregar fecha.' }); }
}

export async function updateImportantDate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await svc.updateImportantDate(req.userId!, req.params.id, req.params.dateId, req.body);
    res.json({ relationship: s(r) });
  } catch { res.status(500).json({ error: 'Error al actualizar fecha.' }); }
}

export async function deleteImportantDate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await svc.deleteImportantDate(req.userId!, req.params.id, req.params.dateId);
    res.json({ relationship: s(r) });
  } catch { res.status(500).json({ error: 'Error al eliminar fecha.' }); }
}

export async function getLoveDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await svc.getLoveDashboard(req.userId!);
    res.json(data);
  } catch { res.status(500).json({ error: 'Error al obtener dashboard.' }); }
}
