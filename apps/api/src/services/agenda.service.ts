import { prisma } from '../lib/prisma';

export async function listEvents(
  userId: string,
  opts: { from?: string; to?: string; date?: string },
) {
  let where: Record<string, unknown> = { userId };

  if (opts.date) {
    const d = new Date(opts.date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where = { ...where, startDate: { gte: start, lt: end } };
  } else if (opts.from || opts.to) {
    const dateFilter: Record<string, Date> = {};
    if (opts.from) dateFilter.gte = new Date(opts.from);
    if (opts.to)   dateFilter.lte = new Date(opts.to);
    where = { ...where, startDate: dateFilter };
  }

  return prisma.agendaEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
  });
}

export async function getUpcoming(userId: string, limit = 5) {
  return prisma.agendaEvent.findMany({
    where: { userId, startDate: { gte: new Date() }, isCompleted: false },
    orderBy: { startDate: 'asc' },
    take: limit,
  });
}

export async function getEvent(userId: string, id: string) {
  return prisma.agendaEvent.findFirst({ where: { id, userId } });
}

export async function createEvent(
  userId: string,
  body: {
    title: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate?: string;
    isAllDay?: boolean;
    location?: string;
    reminder?: number;
    color?: string;
  },
) {
  return prisma.agendaEvent.create({
    data: {
      userId,
      title: body.title,
      description: body.description,
      category: body.category ?? 'personal',
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isAllDay: body.isAllDay ?? false,
      location: body.location,
      reminder: body.reminder,
      color: body.color,
    },
  });
}

export async function updateEvent(
  userId: string,
  id: string,
  body: Record<string, unknown>,
) {
  const data: Record<string, unknown> = {};
  const fields = ['title', 'description', 'category', 'location', 'reminder', 'color', 'isAllDay', 'isCompleted'] as const;
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  if (body.startDate) data.startDate = new Date(body.startDate as string);
  if (body.endDate)   data.endDate   = new Date(body.endDate as string);

  return prisma.agendaEvent.update({ where: { id, userId }, data });
}

export async function deleteEvent(userId: string, id: string) {
  return prisma.agendaEvent.delete({ where: { id, userId } });
}
