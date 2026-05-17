import api from '../lib/api';

export async function sageChat(message: string): Promise<{ reply: string }> {
  const { data } = await api.post<{ reply: string }>('/sage/chat', { message });
  return data;
}

export async function sageSuggestQuests(): Promise<{ quests: unknown[] }> {
  const { data } = await api.post<{ quests: unknown[] }>('/sage/suggest-quests');
  return data;
}

export async function sageAnalyzeHabits(): Promise<{ reply: string }> {
  const { data } = await api.post<{ reply: string }>('/sage/analyze-habits');
  return data;
}

export async function sageAnalyzeFinances(): Promise<{ reply: string }> {
  const { data } = await api.post<{ reply: string }>('/sage/analyze-finances');
  return data;
}

export async function sagePlanWorkout(): Promise<{ reply: string }> {
  const { data } = await api.post<{ reply: string }>('/sage/plan-workout');
  return data;
}

export async function sageDailySummary(): Promise<{ reply: string }> {
  const { data } = await api.get<{ reply: string }>('/sage/daily-summary');
  return data;
}

export async function sageDailyTip(): Promise<{ tip: string }> {
  const { data } = await api.get<{ tip: string }>('/sage/daily-tip');
  return data;
}

export async function sageRateInfo(): Promise<{ callsToday: number; limit: number; remaining: number }> {
  const { data } = await api.get<{ callsToday: number; limit: number; remaining: number }>('/sage/rate-info');
  return data;
}
