import api from '../lib/api';
import type { User, AvatarConfig } from '@lifequest/shared';

export async function fetchCharacter(): Promise<User & { inventoryItems: unknown[]; achievements: unknown[] }> {
  const { data } = await api.get('/users/me/character');
  return data.character;
}

export async function updateAvatar(avatarConfig: Partial<AvatarConfig>): Promise<User> {
  const { data } = await api.put<{ user: User }>('/users/me/avatar', avatarConfig);
  return data.user;
}

export interface OnboardingPayload {
  displayName?: string;
  birthDate?: string;
  timezone?: string;
  avatarConfig?: Partial<AvatarConfig>;
  goalCategories?: string[];
  mainQuestTitle?: string;
  mainQuestCategory?: string;
  mainQuestDeadline?: string;
}

export async function completeOnboarding(payload: OnboardingPayload): Promise<User> {
  const { data } = await api.put<{ user: User }>('/users/me/onboarding', payload);
  return data.user;
}

export async function updateProfile(payload: { displayName?: string; timezone?: string; currency?: string; language?: string; gymPlaylistUrl?: string | null }): Promise<User> {
  const { data } = await api.patch<{ user: User }>('/users/me/profile', payload);
  return data.user;
}

export async function fetchDashboard() {
  const { data } = await api.get('/dashboard');
  return data;
}
