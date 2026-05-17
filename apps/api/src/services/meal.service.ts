import { prisma } from '../lib/prisma';

export async function listMeals(userId: string, date?: string) {
  const where: Record<string, unknown> = { userId };
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.date = { gte: start, lt: end };
  }
  return prisma.meal.findMany({ where, orderBy: { date: 'asc' } });
}

export async function createMeal(userId: string, body: { name: string; mealType: string; calories?: number; protein?: number; carbs?: number; fat?: number; waterMl?: number; date?: string }) {
  return prisma.meal.create({
    data: {
      userId,
      name: body.name,
      mealType: body.mealType,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      waterMl: body.waterMl,
      date: body.date ? new Date(body.date) : new Date(),
    },
  });
}

export async function deleteMeal(userId: string, id: string) {
  return prisma.meal.delete({ where: { id, userId } });
}

export async function getMealSummary(userId: string, from: string, to: string) {
  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { date: 'asc' },
  });

  const byDay = meals.reduce((acc, m) => {
    const key = m.date.toISOString().split('T')[0];
    if (!acc[key]) acc[key] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalWaterMl: 0, meals: [] };
    acc[key].totalCalories += m.calories ?? 0;
    acc[key].totalProtein += m.protein ?? 0;
    acc[key].totalCarbs += m.carbs ?? 0;
    acc[key].totalFat += m.fat ?? 0;
    acc[key].totalWaterMl += m.waterMl ?? 0;
    acc[key].meals.push(m);
    return acc;
  }, {} as Record<string, { totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; totalWaterMl: number; meals: typeof meals }>);

  return { byDay };
}
