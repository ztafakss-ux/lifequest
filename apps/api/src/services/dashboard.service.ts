import { prisma } from '../lib/prisma';

export async function getDashboard(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [user, activeQuests, recentWorkout, sleepLogs, monthTransactions, recentAchievements, todayHabits] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true, displayName: true, level: true, xp: true, xpToNextLevel: true,
          gold: true, hp: true, maxHp: true, mp: true, maxMp: true,
          strength: true, intelligence: true, charisma: true,
          avatarConfig: true, currentStreak: true, longestStreak: true,
          createdAt: true, onboardingCompleted: true,
        },
      }),
      prisma.quest.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: [{ type: 'asc' }, { deadline: 'asc' }],
        take: 5,
      }),
      prisma.workout.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.sleepLog.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth } },
        select: { type: true, amount: true },
      }),
      prisma.userAchievement.findMany({
        where: { userId, unlockedAt: { gte: sevenDaysAgo } },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 3,
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          logs: {
            where: { date: todayStart },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 6,
      }),
    ]);

  const sleepAvg7d =
    sleepLogs.length > 0
      ? sleepLogs.reduce((sum, s) => sum + s.duration, 0) / sleepLogs.length
      : 0;

  let monthIncome = 0;
  let monthExpenses = 0;
  for (const t of monthTransactions) {
    const amt = Number(t.amount);
    if (t.type === 'INCOME') monthIncome += amt;
    else monthExpenses += amt;
  }

  const daysSinceJoin = Math.floor(
    (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    user: { ...user, createdAt: user.createdAt.toISOString() },
    todayQuests: activeQuests,
    recentWorkout: recentWorkout
      ? { ...recentWorkout, date: recentWorkout.date.toISOString() }
      : null,
    sleepAvg7d: Math.round(sleepAvg7d * 10) / 10,
    monthIncome,
    monthExpenses,
    monthBalance: monthIncome - monthExpenses,
    daysSinceJoin,
    recentAchievements: recentAchievements.map((ua) => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt.toISOString(),
    })),
    todayHabits: todayHabits.map((h) => ({
      id: h.id,
      title: h.title,
      icon: h.icon,
      color: h.color,
      currentStreak: h.currentStreak,
      xpReward: h.xpReward,
      todayStatus: h.logs[0]?.status ?? null,
      todayCompleted: h.logs[0]?.completed ?? null,
    })),
  };
}

export async function getTodayQuests(userId: string) {
  const now = new Date();

  const quests = await prisma.quest.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: [{ type: 'asc' }, { deadline: 'asc' }],
    take: 10,
  });

  // Prioritize: DAILY first, then by deadline proximity
  const sorted = quests.sort((a, b) => {
    if (a.type === 'DAILY' && b.type !== 'DAILY') return -1;
    if (b.type === 'DAILY' && a.type !== 'DAILY') return 1;
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  return sorted.slice(0, 5).map((q) => ({
    ...q,
    deadline: q.deadline?.toISOString() ?? null,
    completedAt: q.completedAt?.toISOString() ?? null,
    lastResetAt: q.lastResetAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    daysUntilDeadline: q.deadline
      ? Math.ceil((new Date(q.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}
