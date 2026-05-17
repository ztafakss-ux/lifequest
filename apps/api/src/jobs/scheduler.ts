import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendPush, isInQuietHours } from '../services/notification.service';
import { generateDailyScroll } from '../services/scrolls.service';
import { seedWisdomCards } from '../services/wisdom.service';

export function initScheduler() {
  // Every 15 minutes: reset dailies for users whose local 4am has passed
  cron.schedule('*/15 * * * *', async () => {
    try {
      await resetDailyQuestsForUsersInTimezone();
    } catch (err) {
      console.error('[Scheduler] Error resetting daily quests:', err);
    }
  });

  // Every Sunday at 4am UTC: reset weekly quests
  cron.schedule('0 4 * * 0', async () => {
    try {
      await resetWeeklyQuests();
    } catch (err) {
      console.error('[Scheduler] Error resetting weekly quests:', err);
    }
  });

  // Every hour: fail expired quests
  cron.schedule('0 * * * *', async () => {
    try {
      await failExpiredQuests();
    } catch (err) {
      console.error('[Scheduler] Error failing expired quests:', err);
    }
  });

  // Every day at 1am UTC: check habit streaks for users who didn't log yesterday
  cron.schedule('0 1 * * *', async () => {
    try {
      await penalizeInactiveHabitStreaks();
    } catch (err) {
      console.error('[Scheduler] Error updating habit streaks:', err);
    }
  });

  // Quest deadline alerts: every hour check for quests due in 2 hours
  cron.schedule('0 * * * *', async () => {
    try {
      await sendDeadlineAlerts();
    } catch (err) {
      console.error('[Scheduler] Error sending deadline alerts:', err);
    }
  });

  // Daily summary at 9pm UTC (adjust per user timezone in prod)
  cron.schedule('0 21 * * *', async () => {
    try {
      await sendDailySummaries();
    } catch (err) {
      console.error('[Scheduler] Error sending daily summaries:', err);
    }
  });

  // Daily at 7am UTC: generate proactive Sage scrolls for all active users
  cron.schedule('0 7 * * *', async () => {
    try {
      const users = await prisma.user.findMany({
        where: { onboardingCompleted: true },
        select: { id: true },
        take: 200,
      });
      for (const u of users) {
        await generateDailyScroll(u.id).catch(() => null);
      }
    } catch (err) {
      console.error('[Scheduler] Error generating daily scrolls:', err);
    }
  });

  // On startup: seed wisdom cards
  seedWisdomCards().catch(() => null);

  console.log('⏰ Scheduler inicializado con 7 cron jobs activos (Fase 9)');
}

async function resetDailyQuestsForUsersInTimezone() {
  // Find daily recurring quests that haven't been reset today
  const todayStart = new Date();
  todayStart.setHours(4, 0, 0, 0);

  const questsToReset = await prisma.quest.findMany({
    where: {
      type: 'DAILY',
      isRecurring: true,
      status: 'COMPLETED',
      completedAt: { lt: todayStart },
    },
  });

  if (questsToReset.length === 0) return;

  await prisma.quest.updateMany({
    where: { id: { in: questsToReset.map((q) => q.id) } },
    data: { status: 'ACTIVE', completedAt: null, lastResetAt: new Date() },
  });

  console.log(`[Scheduler] Reset ${questsToReset.length} daily quests`);
}

async function resetWeeklyQuests() {
  const lastMonday = new Date();
  lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() + 1);
  lastMonday.setHours(4, 0, 0, 0);

  const questsToReset = await prisma.quest.findMany({
    where: {
      type: 'WEEKLY',
      isRecurring: true,
      status: 'COMPLETED',
      completedAt: { lt: lastMonday },
    },
  });

  if (questsToReset.length === 0) return;

  await prisma.quest.updateMany({
    where: { id: { in: questsToReset.map((q) => q.id) } },
    data: { status: 'ACTIVE', completedAt: null, lastResetAt: new Date() },
  });

  console.log(`[Scheduler] Reset ${questsToReset.length} weekly quests`);
}

async function failExpiredQuests() {
  const now = new Date();

  const expired = await prisma.quest.findMany({
    where: {
      status: 'ACTIVE',
      deadline: { lt: now },
      isRecurring: false,
    },
  });

  if (expired.length === 0) return;

  await prisma.quest.updateMany({
    where: { id: { in: expired.map((q) => q.id) } },
    data: { status: 'FAILED' },
  });

  console.log(`[Scheduler] Failed ${expired.length} expired quests`);
}

async function penalizeInactiveHabitStreaks() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const activeHabits = await prisma.habit.findMany({
    where: { isActive: true, currentStreak: { gt: 0 } },
  });

  for (const habit of activeHabits) {
    const log = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: habit.id, date: yesterday } },
    });

    if (!log || log.status === 'failed') {
      await prisma.habit.update({
        where: { id: habit.id },
        data: { currentStreak: 0 },
      });
    }
  }
}

async function sendDeadlineAlerts() {
  if (!process.env.VAPID_PUBLIC_KEY) return;

  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

  const urgentQuests = await prisma.quest.findMany({
    where: {
      status: 'ACTIVE',
      deadline: { gte: oneHourFromNow, lte: twoHoursFromNow },
    },
    include: { user: { include: { notificationPreferences: true, pushSubscriptions: true } } },
  });

  for (const quest of urgentQuests) {
    const prefs = quest.user.notificationPreferences;
    if (!prefs?.questDeadlineAlerts) continue;
    if (quest.user.pushSubscriptions.length === 0) continue;
    if (isInQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) continue;

    await sendPush(quest.userId, {
      title: '⚠️ Misión por vencer',
      body: `"${quest.title}" vence en 2 horas. ¡Tú puedes!`,
      tag: `deadline-${quest.id}`,
      data: { questId: quest.id },
    });
  }
}

async function sendDailySummaries() {
  if (!process.env.VAPID_PUBLIC_KEY) return;

  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    include: { notificationPreferences: true, pushSubscriptions: true },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  for (const user of users) {
    const prefs = user.notificationPreferences;
    if (!prefs?.dailySummary) continue;
    if (isInQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) continue;

    const [completions, xpEvents] = await Promise.all([
      prisma.questCompletion.count({ where: { userId: user.id, completedAt: { gte: todayStart } } }),
      prisma.xpEvent.aggregate({ where: { userId: user.id, createdAt: { gte: todayStart } }, _sum: { xpAmount: true } }),
    ]);

    const xpToday = xpEvents._sum.xpAmount ?? 0;

    await sendPush(user.id, {
      title: '📜 Tu día en LifeQuest',
      body: `Completaste ${completions} misiones y ganaste ${xpToday} XP hoy. ¡Sigue así, héroe!`,
      tag: 'daily-summary',
    });
  }
}
