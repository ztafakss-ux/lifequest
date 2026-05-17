import { prisma } from '../lib/prisma';

export async function listJournal(userId: string, filters: { month?: string; tag?: string; search?: string }) {
  const where: Record<string, unknown> = { userId };

  if (filters.month) {
    const [year, m] = filters.month.split('-').map(Number);
    where.date = { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
  }

  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.journalEntry.findMany({ where, orderBy: { date: 'desc' }, take: 100 });
}

export async function getJournalEntry(userId: string, id: string) {
  return prisma.journalEntry.findFirst({ where: { id, userId } });
}

export async function createJournalEntry(userId: string, body: { title?: string; content: string; mood?: number; date?: string; tags?: string[] }) {
  return prisma.journalEntry.create({
    data: {
      userId,
      title: body.title,
      content: body.content,
      mood: body.mood,
      date: body.date ? new Date(body.date) : new Date(),
      tags: body.tags ?? [],
    },
  });
}

export async function updateJournalEntry(userId: string, id: string, body: Record<string, unknown>) {
  return prisma.journalEntry.update({
    where: { id, userId },
    data: {
      ...(body.title !== undefined ? { title: body.title as string } : {}),
      ...(body.content ? { content: body.content as string } : {}),
      ...(body.mood !== undefined ? { mood: body.mood as number } : {}),
      ...(body.date ? { date: new Date(body.date as string) } : {}),
      ...(body.tags !== undefined ? { tags: body.tags as string[] } : {}),
    },
  });
}

export async function deleteJournalEntry(userId: string, id: string) {
  return prisma.journalEntry.delete({ where: { id, userId } });
}

export async function getJournalStreak(userId: string) {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dates = entries.map(e => {
    const d = new Date(e.date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  });
  const unique = [...new Set(dates)].sort((a, b) => b - a);

  let currentStreak = 1;
  const today = new Date();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const DAY = 86400000;

  if (unique[0] < todayMs - DAY) {
    currentStreak = 0;
  } else {
    for (let i = 1; i < unique.length; i++) {
      if (unique[i - 1] - unique[i] === DAY) currentStreak++;
      else break;
    }
  }

  let longestStreak = 1;
  let cur = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i - 1] - unique[i] === DAY) {
      cur++;
      longestStreak = Math.max(longestStreak, cur);
    } else {
      cur = 1;
    }
  }

  return { currentStreak, longestStreak, lastEntryDate: entries[0]?.date.toISOString() };
}
