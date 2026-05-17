import { prisma } from '../lib/prisma';

export async function getActiveSeason() {
  return prisma.season.findFirst({
    where: { isActive: true },
    include: {
      events: {
        where: {
          startDate: { lte: new Date() },
          endDate:   { gte: new Date() },
        },
      },
      participants: {
        orderBy: { damageDealt: 'desc' },
        take: 10,
        include: { user: { select: { displayName: true, username: true, level: true } } },
      },
    },
  });
}

export async function getSeasonForUser(userId: string) {
  const season = await getActiveSeason();
  if (!season) return null;

  const participant = season.participants.find((p) => p.userId === userId);
  return { season, userDamage: participant?.damageDealt ?? 0 };
}

export async function damageSeasonBoss(userId: string, damage: number): Promise<void> {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season || season.currentHp <= 0) return;

  const newHp = Math.max(0, season.currentHp - damage);

  await Promise.all([
    prisma.season.update({
      where: { id: season.id },
      data: { currentHp: newHp },
    }),
    prisma.seasonParticipant.upsert({
      where: { seasonId_userId: { seasonId: season.id, userId } },
      update: { damageDealt: { increment: damage } },
      create: { seasonId: season.id, userId, damageDealt: damage },
    }),
  ]);

  // If boss just died, mark season inactive
  if (newHp === 0 && season.currentHp > 0) {
    await prisma.season.update({
      where: { id: season.id },
      data: { isActive: false },
    });
  }
}

export async function createSeason(data: {
  name: string;
  description: string;
  bossName: string;
  bossHp: number;
  startDate: Date;
  endDate: Date;
  rewards?: Array<Record<string, unknown>>;
}) {
  // Deactivate current season if any
  await prisma.season.updateMany({ where: { isActive: true }, data: { isActive: false } });

  return prisma.season.create({
    data: {
      name: data.name,
      description: data.description,
      bossName: data.bossName,
      bossHp: data.bossHp,
      currentHp: data.bossHp,
      startDate: data.startDate,
      endDate: data.endDate,
      rewards: (data.rewards ?? []) as import('@prisma/client').Prisma.InputJsonValue,
    },
  });
}

export async function seedInitialSeason(): Promise<void> {
  const existing = await prisma.season.findFirst({ where: { isActive: true } });
  if (existing) return;

  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await createSeason({
    name: 'La Temporada del Hierro',
    description: 'El Dragón de la Pereza acecha el reino. ¡Únanse heroes para derrotarlo!',
    bossName: 'El Dragón de la Pereza',
    bossHp: 1_000_000,
    startDate: now,
    endDate,
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 1000 },
    ],
  });
}
