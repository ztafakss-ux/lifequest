import { prisma } from '../lib/prisma';
import type { QuestCategory, QuestDifficulty } from '@prisma/client';

export interface AchievementCheckEvent {
  questDifficulty?: QuestDifficulty;
  questCategory?: QuestCategory;
  completedHour?: number;
  habitStreak?: number;
  leveledUp?: boolean;
  newLevel?: number;
}

export interface UnlockedAchievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

export async function checkAchievements(
  userId: string,
  event: string,
  context: AchievementCheckEvent = {}
): Promise<UnlockedAchievement[]> {
  const newly: UnlockedAchievement[] = [];

  // Get all achievements + already unlocked by user
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  const totalQuests = await prisma.questCompletion.count({ where: { userId } });
  const totalHabits = await prisma.habit.count({ where: { userId, isActive: true } });

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.key) {
      case 'first_quest':
        shouldUnlock = event === 'quest_completed' && totalQuests >= 1;
        break;
      case 'quests_10':
        shouldUnlock = event === 'quest_completed' && totalQuests >= 10;
        break;
      case 'quests_50':
        shouldUnlock = event === 'quest_completed' && totalQuests >= 50;
        break;
      case 'quests_100':
        shouldUnlock = event === 'quest_completed' && totalQuests >= 100;
        break;
      case 'quests_500':
        shouldUnlock = event === 'quest_completed' && totalQuests >= 500;
        break;
      case 'epic_quest':
        shouldUnlock = event === 'quest_completed' && context.questDifficulty === 'EPIC';
        break;
      case 'early_bird':
        shouldUnlock = event === 'quest_completed' && (context.completedHour ?? 12) < 7;
        break;
      case 'night_owl':
        shouldUnlock = event === 'quest_completed' && (context.completedHour ?? 12) >= 23;
        break;
      case 'fitness_25': {
        const fitnessCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'FITNESS' } } });
        shouldUnlock = fitnessCount >= 25;
        break;
      }
      case 'learning_10': {
        const learningCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'LEARNING' } } });
        shouldUnlock = learningCount >= 10;
        break;
      }
      case 'love_10': {
        const loveCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'LOVE' } } });
        shouldUnlock = loveCount >= 10;
        break;
      }
      case 'health_20': {
        const healthCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'HEALTH' } } });
        shouldUnlock = healthCount >= 20;
        break;
      }
      case 'social_butterfly': {
        const socialCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'SOCIAL' } } });
        shouldUnlock = socialCount >= 10;
        break;
      }
      case 'creative_mind': {
        const creativeCount = await prisma.questCompletion.count({ where: { userId, quest: { category: 'CREATIVE' } } });
        shouldUnlock = creativeCount >= 10;
        break;
      }
      case 'streak_7':
        shouldUnlock = (event === 'habit_logged' || event === 'quest_completed') && (context.habitStreak ?? 0) >= 7;
        break;
      case 'streak_30':
        shouldUnlock = (event === 'habit_logged' || event === 'quest_completed') && (context.habitStreak ?? 0) >= 30;
        break;
      case 'streak_100':
        shouldUnlock = (event === 'habit_logged' || event === 'quest_completed') && (context.habitStreak ?? 0) >= 100;
        break;
      case 'first_habit':
        shouldUnlock = event === 'habit_created' && totalHabits >= 1;
        break;
      case 'habits_5':
        shouldUnlock = event === 'habit_created' && totalHabits >= 5;
        break;
      case 'level_5':
        shouldUnlock = context.leveledUp === true && (context.newLevel ?? 0) >= 5;
        break;
      case 'level_10':
        shouldUnlock = context.leveledUp === true && (context.newLevel ?? 0) >= 10;
        break;
      case 'level_25':
        shouldUnlock = context.leveledUp === true && (context.newLevel ?? 0) >= 25;
        break;
      case 'level_50':
        shouldUnlock = context.leveledUp === true && (context.newLevel ?? 0) >= 50;
        break;
      case 'level_100':
        shouldUnlock = context.leveledUp === true && (context.newLevel ?? 0) >= 100;
        break;
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      // Award XP for achievement
      if (achievement.xpReward > 0) {
        await prisma.xpEvent.create({
          data: {
            userId,
            xpAmount: achievement.xpReward,
            goldAmount: 0,
            source: 'achievement_unlocked',
            sourceId: achievement.id,
            description: `Logro desbloqueado: ${achievement.title}`,
          },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        });
      }

      newly.push({
        id: achievement.id,
        key: achievement.key,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    }
  }

  return newly;
}

export async function getUserAchievements(userId: string) {
  const [all, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ category: 'asc' }, { xpReward: 'asc' }] }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
  ]);

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

  const totalQuests = await prisma.questCompletion.count({ where: { userId } });
  const maxHabitStreak = await prisma.habit.aggregate({ where: { userId }, _max: { longestStreak: true } });

  return all.map((ach) => {
    const unlockedAt = unlockedMap.get(ach.id);
    let progress: number | null = null;
    let target = ach.progressTarget;

    if (target && !unlockedAt) {
      switch (ach.progressType) {
        case 'quest_count':
          progress = Math.min(totalQuests, target);
          break;
        case 'habit_streak':
          progress = Math.min(maxHabitStreak._max.longestStreak ?? 0, target);
          break;
      }
    }

    return {
      ...ach,
      unlocked: !!unlockedAt,
      unlockedAt: unlockedAt?.toISOString() ?? null,
      progress,
      target,
    };
  });
}

export async function getRecentAchievements(userId: string, limit = 5) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
    take: limit,
  });
}
