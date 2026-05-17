import api from '../lib/api';

export interface DailyCheckin {
  id: string;
  mood: number;
  energy: number;
  note?: string;
  date: string;
  createdAt: string;
}

export interface CheckinStats {
  avgMood: number;
  avgEnergy: number;
  totalCheckins: number;
  weeklyPattern: { day: number; avgMood: number | null; avgEnergy: number | null }[];
}

export async function getTodayCheckin(): Promise<DailyCheckin | null> {
  const { data } = await api.get('/checkin/today');
  return data;
}

export async function upsertCheckin(mood: number, energy: number, note?: string): Promise<DailyCheckin> {
  const { data } = await api.post('/checkin', { mood, energy, note });
  return data;
}

export async function getCheckinHistory(days = 30): Promise<DailyCheckin[]> {
  const { data } = await api.get('/checkin/history', { params: { days } });
  return data;
}

export async function getCheckinStats(): Promise<CheckinStats> {
  const { data } = await api.get('/checkin/stats');
  return data;
}
