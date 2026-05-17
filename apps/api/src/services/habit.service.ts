import { prisma } from '../lib/prisma';
import { awardXpAndGold } from './xp.service';
import { checkAchievements } from './achievement.service';
import type { QuestCategory } from '@prisma/client';

export interface CreateHabitInput {
  title: string;
  description?: string;
  category: QuestCategory;
  icon?: string;
  color?: string;
  xpReward?: number;
  goldReward?: number;
  frequency?: { type: 'daily' | 'days_per_week'; days: number[] };
  resetTime?: string;
  reminderTime?: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  category?: QuestCategory;
  icon?: string;
  color?: string;
  xpReward?: number;
  goldReward?: number;
  frequency?: { type: 'daily' | 'days_per_week'; days: number[] };
  resetTime?: string;
  reminderTime?: string | null;
}

export async function createHabit(userId: string, input: CreateHabitInput) {
  const habit = await prisma.habit.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      icon: input.icon ?? '⭐',
      color: input.color ?? '#ffd23f',
      xpReward: input.xpReward ?? 20,
      goldReward: input.goldReward ?? 5,
      frequency: input.frequency ?? { type: 'daily', days: [] },
      resetTime: input.resetTime ?? '04:00',
      reminderTime: input.reminderTime,
    },
  });

  await checkAchievements(userId, 'habit_created', {});

  return habit;
}

export async function listHabits(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  // Attach today's log to each habit
  const today = getTodayDate();
  const logs = await prisma.habitLog.findMany({
    where: { userId, date: today },
  });

  const logMap = new Map(logs.map((l) => [l.habitId, l]));

  return habits.map((h) => {
    const todayLog = logMap.get(h.id);
    return {
      ...h,
      frequency: h.frequency as { type: string; days: number[] },
      todayStatus: todayLog?.status ?? null,
      todayCompleted: todayLog?.completed ?? null,
    };
  });
}

export async function getHabitById(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return null;

  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 30,
  });

  return { ...habit, logs };
}

export async function updateHabit(userId: string, habitId: string, input: UpdateHabitInput) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error('HABIT_NOT_FOUND');

  return prisma.habit.update({
    where: { id: habitId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.xpReward !== undefined && { xpReward: input.xpReward }),
      ...(input.goldReward !== undefined && { goldReward: input.goldReward }),
      ...(input.frequency !== undefined && { frequency: input.frequency }),
      ...(input.resetTime !== undefined && { resetTime: input.resetTime }),
      ...(input.reminderTime !== undefined && { reminderTime: input.reminderTime }),
    },
  });
}

export async function archiveHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error('HABIT_NOT_FOUND');
  return prisma.habit.update({ where: { id: habitId }, data: { isActive: false } });
}

export type HabitLogStatus = 'completed' | 'failed' | 'skipped';

export async function logHabit(userId: string, habitId: string, status: HabitLogStatus, notes?: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId, isActive: true } });
  if (!habit) throw new Error('HABIT_NOT_FOUND');

  const today = getTodayDate();
  const completed = status === 'completed';

  // Upsert the log for today
  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: today } },
    create: { habitId, userId, completed, status, date: today, notes },
    update: { completed, status, notes },
  });

  // Update streak
  let { currentStreak, longestStreak } = habit;

  if (status === 'completed') {
    // Check if yesterday was completed or skipped (to continue streak)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLog = await prisma.habitLog.findUnique({ where: { habitId_date: { habitId, date: yesterday } } });

    if (yesterdayLog && (yesterdayLog.completed || yesterdayLog.status === 'skipped')) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  } else if (status === 'failed') {
    currentStreak = 0;
  }
  // 'skipped' doesn't change the streak

  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak },
  });

  let rewards = null;
  let achievementsUnlocked: Awaited<ReturnType<typeof checkAchievements>> = [];

  if (status === 'completed') {
    const result = await awardXpAndGold(userId, habit.xpReward, habit.goldReward, 'habit_completed', {
      sourceId: habitId,
      description: `Hábito completado: ${habit.title}`,
      category: habit.category,
    });

    achievementsUnlocked = await checkAchievements(userId, 'habit_logged', {
      habitStreak: currentStreak,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    });

    rewards = { xpEarned: result.xpGained, goldEarned: result.goldGained, leveledUp: result.leveledUp, newLevel: result.newLevel };
  }

  const updatedHabit = await prisma.habit.findUnique({ where: { id: habitId } });

  return {
    log,
    habit: updatedHabit,
    currentStreak,
    longestStreak,
    rewards,
    achievementsUnlocked,
  };
}

export async function getHabitHeatmap(userId: string, habitId: string, days = 90) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new Error('HABIT_NOT_FOUND');

  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const logs = await prisma.habitLog.findMany({
    where: { habitId, date: { gte: from } },
    orderBy: { date: 'asc' },
  });

  return logs.map((l) => ({
    date: l.date.toISOString().split('T')[0],
    status: l.status,
    completed: l.completed,
  }));
}

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
