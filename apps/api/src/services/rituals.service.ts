import { prisma } from '../lib/prisma';

const PRESET_RITUALS = [
  {
    name: 'Mañana de Campeón',
    type: 'morning',
    icon: '☀️',
    steps: [
      { title: 'Tomar un vaso de agua', durationMin: 1, order: 0 },
      { title: 'Estiramientos básicos', durationMin: 5, order: 1 },
      { title: 'Revisar tus metas del día', durationMin: 3, order: 2 },
      { title: 'Meditación o respiración', durationMin: 5, order: 3 },
      { title: 'Desayuno nutritivo', durationMin: 10, order: 4 },
    ],
  },
  {
    name: 'Noche de Descanso',
    type: 'night',
    icon: '🌙',
    steps: [
      { title: 'Sin pantallas 30 min antes', durationMin: null, order: 0 },
      { title: 'Escribir 3 cosas de hoy', durationMin: 5, order: 1 },
      { title: 'Preparar ropa del día siguiente', durationMin: 3, order: 2 },
      { title: 'Lectura tranquila', durationMin: 15, order: 3 },
      { title: 'Respiración para dormir', durationMin: 3, order: 4 },
    ],
  },
  {
    name: 'Reset de Domingo',
    type: 'custom',
    icon: '🔄',
    steps: [
      { title: 'Revisar la semana pasada', durationMin: 10, order: 0 },
      { title: 'Planificar la semana nueva', durationMin: 15, order: 1 },
      { title: 'Limpiar el espacio de trabajo', durationMin: 10, order: 2 },
      { title: 'Meal prep básico', durationMin: 30, order: 3 },
      { title: 'Tiempo libre sin culpa', durationMin: null, order: 4 },
    ],
  },
];

export async function listRituals(userId: string) {
  return prisma.ritual.findMany({
    where: { userId },
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createRitual(
  userId: string,
  data: {
    name: string;
    type: string;
    icon?: string;
    steps?: { title: string; durationMin?: number; order: number }[];
  }
) {
  return prisma.ritual.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      icon: data.icon ?? '⚡',
      steps: data.steps ? { create: data.steps } : undefined,
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
}

export async function updateRitual(
  userId: string,
  ritualId: string,
  data: Partial<{ name: string; type: string; icon: string; isActive: boolean }>
) {
  await prisma.ritual.findFirstOrThrow({ where: { id: ritualId, userId } });
  return prisma.ritual.update({
    where: { id: ritualId },
    data,
    include: { steps: { orderBy: { order: 'asc' } } },
  });
}

export async function deleteRitual(userId: string, ritualId: string) {
  await prisma.ritual.findFirstOrThrow({ where: { id: ritualId, userId } });
  return prisma.ritual.delete({ where: { id: ritualId } });
}

export async function completeRitual(userId: string, ritualId: string) {
  await prisma.ritual.findFirstOrThrow({ where: { id: ritualId, userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.ritualLog.create({
    data: { ritualId, userId, date: today },
  });

  // Award XP
  const xpEarned = 30;
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpEarned }, gold: { increment: 5 } },
  });

  return { xpEarned, message: '¡Ritual completado! +30 XP' };
}

export async function getRitualStats(userId: string, ritualId: string) {
  const logs = await prisma.ritualLog.findMany({
    where: { ritualId, userId },
    orderBy: { completedAt: 'desc' },
  });

  const thisMonth = logs.filter((l) => {
    const d = new Date(l.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const found = logs.find((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === day.getTime();
    });
    if (found) streak++;
    else break;
  }

  return { totalLogs: logs.length, thisMonth: thisMonth.length, streak };
}

export async function seedPresetRituals(userId: string) {
  const existing = await prisma.ritual.count({ where: { userId } });
  if (existing > 0) return [];

  const created = await Promise.all(
    PRESET_RITUALS.map((r) =>
      prisma.ritual.create({
        data: {
          userId,
          name: r.name,
          type: r.type,
          icon: r.icon,
          steps: {
            create: r.steps.map((s) => ({
              title: s.title,
              durationMin: s.durationMin ?? null,
              order: s.order,
            })),
          },
        },
        include: { steps: { orderBy: { order: 'asc' } } },
      })
    )
  );
  return created;
}
