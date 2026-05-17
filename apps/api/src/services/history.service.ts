import { prisma } from '../lib/prisma';

export async function getHistorySummary(userId: string, from: Date, to: Date) {
  const [questCompletions, habitLogs, xpEvents] = await Promise.all([
    prisma.questCompletion.findMany({
      where: { userId, completedAt: { gte: from, lte: to } },
      include: { quest: { select: { title: true, category: true, difficulty: true, type: true } } },
      orderBy: { completedAt: 'asc' },
    }),
    prisma.habitLog.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: { habit: { select: { title: true, icon: true, category: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Build daily summary map
  const dailyMap = new Map<string, {
    date: string;
    xpGained: number;
    goldGained: number;
    questsCompleted: number;
    habitsCompleted: number;
    habitsFailed: number;
    habitsSkipped: number;
    productivityScore: number;
  }>();

  // Process XP events by day
  for (const event of xpEvents) {
    const dateKey = event.createdAt.toISOString().split('T')[0];
    const day = dailyMap.get(dateKey) ?? {
      date: dateKey,
      xpGained: 0,
      goldGained: 0,
      questsCompleted: 0,
      habitsCompleted: 0,
      habitsFailed: 0,
      habitsSkipped: 0,
      productivityScore: 0,
    };
    day.xpGained += event.xpAmount;
    day.goldGained += event.goldAmount;
    dailyMap.set(dateKey, day);
  }

  // Process quest completions
  for (const qc of questCompletions) {
    const dateKey = qc.completedAt.toISOString().split('T')[0];
    const day = dailyMap.get(dateKey) ?? {
      date: dateKey,
      xpGained: 0,
      goldGained: 0,
      questsCompleted: 0,
      habitsCompleted: 0,
      habitsFailed: 0,
      habitsSkipped: 0,
      productivityScore: 0,
    };
    day.questsCompleted += 1;
    dailyMap.set(dateKey, day);
  }

  // Process habit logs
  for (const log of habitLogs) {
    const dateKey = log.date.toISOString().split('T')[0];
    const day = dailyMap.get(dateKey) ?? {
      date: dateKey,
      xpGained: 0,
      goldGained: 0,
      questsCompleted: 0,
      habitsCompleted: 0,
      habitsFailed: 0,
      habitsSkipped: 0,
      productivityScore: 0,
    };
    if (log.status === 'completed') day.habitsCompleted += 1;
    else if (log.status === 'failed') day.habitsFailed += 1;
    else day.habitsSkipped += 1;
    dailyMap.set(dateKey, day);
  }

  // Calculate productivity scores
  for (const [, day] of dailyMap) {
    const totalHabits = day.habitsCompleted + day.habitsFailed + day.habitsSkipped;
    const habitScore = totalHabits > 0 ? (day.habitsCompleted / totalHabits) * 60 : 0;
    const questScore = Math.min(day.questsCompleted * 10, 40);
    day.productivityScore = Math.round(habitScore + questScore);
  }

  const days = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Category distribution from quest completions
  const categoryCount: Record<string, number> = {};
  for (const qc of questCompletions) {
    const cat = qc.quest.category;
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
  }
  const categoryDistribution = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const totalXp = xpEvents.reduce((s, e) => s + e.xpAmount, 0);
  const totalGold = xpEvents.reduce((s, e) => s + e.goldAmount, 0);

  return {
    days,
    totalXp,
    totalGold,
    totalQuestsCompleted: questCompletions.length,
    totalHabitsCompleted: habitLogs.filter((l) => l.status === 'completed').length,
    categoryDistribution,
  };
}

export async function getDayDetail(userId: string, date: string) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [questCompletions, habitLogs, xpEvents] = await Promise.all([
    prisma.questCompletion.findMany({
      where: { userId, completedAt: { gte: dayStart, lte: dayEnd } },
      include: { quest: { select: { title: true, category: true, difficulty: true, xpReward: true, goldReward: true } } },
    }),
    prisma.habitLog.findMany({
      where: { userId, date: dayStart },
      include: { habit: { select: { title: true, icon: true, category: true, xpReward: true } } },
    }),
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
    }),
  ]);

  const totalXp = xpEvents.reduce((s, e) => s + e.xpAmount, 0);
  const totalGold = xpEvents.reduce((s, e) => s + e.goldAmount, 0);

  return {
    date,
    totalXp,
    totalGold,
    questsCompleted: questCompletions.map((qc) => ({
      questId: qc.questId,
      title: qc.quest.title,
      category: qc.quest.category,
      difficulty: qc.quest.difficulty,
      xpEarned: qc.xpEarned,
      goldEarned: qc.goldEarned,
      completedAt: qc.completedAt.toISOString(),
    })),
    habitLogs: habitLogs.map((l) => ({
      habitId: l.habitId,
      title: l.habit.title,
      icon: l.habit.icon,
      category: l.habit.category,
      status: l.status,
      completed: l.completed,
    })),
  };
}
