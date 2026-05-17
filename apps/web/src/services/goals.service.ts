import api from '../lib/api';

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
  order: number;
}

export interface MasterGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  icon: string;
  targetDate?: string;
  why?: string;
  milestones: GoalMilestone[];
  status: 'ACTIVE' | 'ACHIEVED' | 'PAUSED';
  progress: number;
  createdAt: string;
  achievedAt?: string;
}

export async function listGoals(): Promise<MasterGoal[]> {
  const { data } = await api.get('/goals');
  return data;
}

export async function createGoal(payload: {
  title: string;
  description?: string;
  category: string;
  icon?: string;
  targetDate?: string;
  why?: string;
  milestones?: { title: string; order: number }[];
}): Promise<MasterGoal> {
  const { data } = await api.post('/goals', payload);
  return data;
}

export async function updateGoal(id: string, payload: Partial<MasterGoal>): Promise<MasterGoal> {
  const { data } = await api.patch(`/goals/${id}`, payload);
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}

export async function toggleMilestone(milestoneId: string): Promise<MasterGoal> {
  const { data } = await api.patch(`/goals/milestones/${milestoneId}/toggle`);
  return data;
}

export async function addMilestone(goalId: string, title: string): Promise<GoalMilestone> {
  const { data } = await api.post(`/goals/${goalId}/milestones`, { title });
  return data;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  await api.delete(`/goals/milestones/${milestoneId}`);
}

export async function aiBreakdownGoal(goalId: string): Promise<{ title: string; order: number }[]> {
  const { data } = await api.post(`/goals/${goalId}/ai-breakdown`);
  return data;
}
