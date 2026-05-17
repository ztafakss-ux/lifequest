import { prisma } from '../lib/prisma';
import { generateText, hasAIProvider } from '../lib/ai';

// ─── Nutrition Goals ───────────────────────────────────────────────────────────

export async function getNutritionGoal(userId: string) {
  return prisma.nutritionGoal.findUnique({ where: { userId } });
}

export async function upsertNutritionGoal(
  userId: string,
  data: { calories?: number; protein?: number; carbs?: number; fat?: number; waterMl?: number }
) {
  return prisma.nutritionGoal.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// ─── Saved Meals ───────────────────────────────────────────────────────────────

export async function getSavedMeals(userId: string) {
  return prisma.savedMeal.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function createSavedMeal(
  userId: string,
  data: { name: string; calories?: number; protein?: number; carbs?: number; fat?: number }
) {
  return prisma.savedMeal.create({ data: { userId, ...data } });
}

export async function deleteSavedMeal(userId: string, id: string) {
  return prisma.savedMeal.deleteMany({ where: { id, userId } });
}

// ─── AI Quick Log ──────────────────────────────────────────────────────────────

export async function parseMealWithAI(description: string): Promise<{
  name: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}> {
  if (!hasAIProvider()) {
    return {
      name: description,
      estimatedCalories: 0,
      estimatedProtein: 0,
      estimatedCarbs: 0,
      estimatedFat: 0,
    };
  }

  const prompt = `Eres un nutricionista experto. El usuario describe su comida en texto libre.
Devuelve SOLO un JSON válido (sin markdown, sin explicaciones) con este formato exacto:
{"name":"nombre resumido","estimatedCalories":número,"estimatedProtein":número,"estimatedCarbs":número,"estimatedFat":número}

Las cantidades son en gramos para macros y kcal para calorías. Estima con conocimiento de comida colombiana/latinoamericana.

Comida del usuario: "${description}"`;

  const text = await generateText([{ role: 'user', content: prompt }], {
    temperature: 0.3,
    maxTokens: 200,
  });

  try {
    return JSON.parse(text.trim());
  } catch {
    return {
      name: description,
      estimatedCalories: 0,
      estimatedProtein: 0,
      estimatedCarbs: 0,
      estimatedFat: 0,
    };
  }
}

// ─── Daily Macro Summary ───────────────────────────────────────────────────────

export async function getDailyMacros(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const [meals, goal] = await Promise.all([
    prisma.meal.findMany({
      where: { userId, date: { gte: start, lte: end } },
    }),
    prisma.nutritionGoal.findUnique({ where: { userId } }),
  ]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
      fat: acc.fat + (m.fat ?? 0),
      waterMl: acc.waterMl + (m.waterMl ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 }
  );

  return { totals, goal, meals };
}
