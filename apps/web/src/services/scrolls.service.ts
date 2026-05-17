import api from '../lib/api';

export interface SageScroll {
  id: string;
  message: string;
  category: 'warning' | 'praise' | 'nudge' | 'milestone';
  isRead: boolean;
  createdAt: string;
}

export async function getUnreadScrolls(): Promise<SageScroll[]> {
  const { data } = await api.get('/scrolls');
  return data;
}

export async function generateScroll(): Promise<SageScroll[]> {
  const { data } = await api.post('/scrolls/generate');
  return data;
}

export async function markScrollRead(id: string): Promise<void> {
  await api.patch(`/scrolls/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.post('/scrolls/read-all');
}
