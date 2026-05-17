import api from '../lib/api';

export interface DayData {
  date: string;
  xpGained: number;
  goldGained: number;
  questsCompleted: number;
  habitsCompleted: number;
  habitsFailed: number;
  habitsSkipped: number;
  productivityScore: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface HistorySummary {
  days: DayData[];
  totalXp: number;
  totalGold: number;
  totalQuestsCompleted: number;
  totalHabitsCompleted: number;
  categoryDistribution: CategoryData[];
}

export interface DayDetail {
  date: string;
  totalXp: number;
  totalGold: number;
  questsCompleted: Array<{
    questId: string;
    title: string;
    category: string;
    difficulty: string;
    xpEarned: number;
    goldEarned: number;
    completedAt: string;
  }>;
  habitLogs: Array<{
    habitId: string;
    title: string;
    icon: string;
    category: string;
    status: string;
    completed: boolean;
  }>;
}

export async function fetchHistory(from?: string, to?: string): Promise<HistorySummary> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const { data } = await api.get<HistorySummary>(`/history?${params}`);
  return data;
}

export async function fetchDayDetail(date: string): Promise<DayDetail> {
  const { data } = await api.get<DayDetail>(`/history/day/${date}`);
  return data;
}
