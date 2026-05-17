import api from '../lib/api';

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  progressType?: string;
  progressTarget?: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data } = await api.get<{ achievements: Achievement[] }>('/achievements');
  return data.achievements;
}

export async function fetchRecentAchievements(): Promise<Achievement[]> {
  const { data } = await api.get<{ recent: Achievement[] }>('/achievements/recent');
  return data.recent;
}
