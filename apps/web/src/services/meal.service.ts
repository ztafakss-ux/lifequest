import api from '../lib/api';
import type { Meal } from '@lifequest/shared';

export async function fetchMeals(date?: string): Promise<Meal[]> {
  const params = date ? `?date=${date}` : '';
  const { data } = await api.get<{ meals: Meal[] }>(`/meals${params}`);
  return data.meals;
}

export async function createMeal(body: { name: string; mealType: string; calories?: number; protein?: number; carbs?: number; fat?: number; waterMl?: number; date?: string }): Promise<Meal> {
  const { data } = await api.post<{ meal: Meal }>('/meals', body);
  return data.meal;
}

export async function deleteMeal(id: string): Promise<void> {
  await api.delete(`/meals/${id}`);
}

export async function fetchMealSummary(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const { data } = await api.get(`/meals/summary?${params}`);
  return data;
}
