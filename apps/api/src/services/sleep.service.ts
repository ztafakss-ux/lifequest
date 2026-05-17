import { prisma } from '../lib/prisma';

export async function listSleep(userId: string, month?: string) {
  const where: Record<string, unknown> = { userId };
  if (month) {
    const [year, m] = month.split('-').map(Number);
    where.date = { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
  }
  return prisma.sleepLog.findMany({ where, orderBy: { date: 'desc' }, take: 60 });
}

function calcSleepScore(duration: number, quality: number, bedtime: Date): number {
  let score = 0;
  if (duration >= 7 && duration <= 9) score += 40;
  else if (duration >= 6) score += 30;
  else score += Math.max(0, Math.round(duration * 5));
  score += quality * 6;
  const bedHour = bedtime.getHours() + bedtime.getMinutes() / 60;
  if (bedHour >= 22 && bedHour <= 23.5) score += 30;
  else if (bedHour >= 21 || bedHour <= 0.5) score += 20;
  else score += 10;
  return Math.min(100, Math.round(score));
}

export async function createSleep(
  userId: string,
  body: { bedtime: string; wakeTime: string; quality: number; notes?: string; date?: string; caffeineLate?: boolean; screensBeforeBed?: boolean; exercisedToday?: boolean }
) {
  const bedtime = new Date(body.bedtime);
  const wakeTime = new Date(body.wakeTime);
  let duration = (wakeTime.getTime() - bedtime.getTime()) / 3600000;
  if (duration < 0) duration += 24;

  const sleepScore = calcSleepScore(duration, body.quality, bedtime);

  return prisma.sleepLog.create({
    data: {
      userId,
      bedtime,
      wakeTime,
      duration,
      quality: body.quality,
      notes: body.notes,
      date: body.date ? new Date(body.date) : new Date(),
      sleepScore,
      caffeineLate: body.caffeineLate,
      screensBeforeBed: body.screensBeforeBed,
      exercisedToday: body.exercisedToday,
    },
  });
}

export async function updateSleep(userId: string, id: string, body: Partial<{ bedtime: string; wakeTime: string; quality: number; notes: string }>) {
  const updates: Record<string, unknown> = {};
  if (body.bedtime) updates.bedtime = new Date(body.bedtime);
  if (body.wakeTime) updates.wakeTime = new Date(body.wakeTime);
  if (body.quality !== undefined) updates.quality = body.quality;
  if (body.notes !== undefined) updates.notes = body.notes;

  if (body.bedtime && body.wakeTime) {
    const bedtime = new Date(body.bedtime);
    const wakeTime = new Date(body.wakeTime);
    let duration = (wakeTime.getTime() - bedtime.getTime()) / 3600000;
    if (duration < 0) duration += 24;
    updates.duration = duration;
  }

  return prisma.sleepLog.update({ where: { id, userId }, data: updates });
}

export async function deleteSleep(userId: string, id: string) {
  return prisma.sleepLog.delete({ where: { id, userId } });
}

export async function getSleepStats(userId: string) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const logs = await prisma.sleepLog.findMany({
    where: { userId, date: { gte: twoWeeksAgo } },
    orderBy: { date: 'desc' },
  });

  if (logs.length === 0) return { avgDuration: 0, avgQuality: 0, totalLogs: 0, weeklyAvg: 0, trend: 'stable' };

  const avgDuration = logs.reduce((a, l) => a + l.duration, 0) / logs.length;
  const avgQuality = logs.reduce((a, l) => a + l.quality, 0) / logs.length;

  const weekLogs = logs.slice(0, 7);
  const prevWeekLogs = logs.slice(7, 14);
  const weeklyAvg = weekLogs.length > 0 ? weekLogs.reduce((a, l) => a + l.duration, 0) / weekLogs.length : 0;
  const prevWeeklyAvg = prevWeekLogs.length > 0 ? prevWeekLogs.reduce((a, l) => a + l.duration, 0) / prevWeekLogs.length : 0;

  const trend = weeklyAvg > prevWeeklyAvg + 0.25 ? 'improving' : weeklyAvg < prevWeeklyAvg - 0.25 ? 'declining' : 'stable';

  return { avgDuration, avgQuality, totalLogs: logs.length, weeklyAvg, trend };
}
