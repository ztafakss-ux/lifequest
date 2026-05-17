import api from '../lib/api';

export interface FocusStats {
  totalMinutes: number;
  weekMinutes: number;
  weekSessions: number;
  recentSessions: { id: string; durationMin: number; taskLabel: string | null; completedAt: string }[];
}

export async function logFocusSession(
  durationMin: number,
  questId?: string,
  taskLabel?: string
): Promise<{ xpEarned: number; message: string }> {
  const { data } = await api.post('/focus/complete', { durationMin, questId, taskLabel });
  return data;
}

export async function getFocusStats(): Promise<FocusStats> {
  const { data } = await api.get('/focus/stats');
  return data;
}
