import { prisma } from '../lib/prisma';

const WISDOM_SEED: {
  quote: string;
  author?: string;
  category: string;
  levelRequired: number;
}[] = [
  // Nivel 1 — disponibles desde el inicio
  { quote: 'Primero dominate a ti mismo, luego puedes dominar el mundo.', author: 'Confucio', category: 'discipline', levelRequired: 1 },
  { quote: 'La consistencia vence al talento cuando el talento no es consistente.', category: 'discipline', levelRequired: 1 },
  { quote: 'No necesitas ser extremo. Solo necesitas ser consistente.', category: 'growth', levelRequired: 1 },
  { quote: 'Tu cuerpo puede soportarlo. Es tu mente la que hay que convencer.', category: 'health', levelRequired: 1 },
  { quote: 'Cada peso que ahorras es una decisión futura que ya tomaste.', category: 'finance', levelRequired: 1 },
  { quote: 'La energía fluye donde la atención va.', author: 'Tony Robbins', category: 'mindset', levelRequired: 1 },
  { quote: 'No estás construyendo hábitos. Estás construyendo la identidad de quien quieres ser.', author: 'James Clear', category: 'discipline', levelRequired: 1 },
  { quote: 'Las pequeñas victorias diarias construyen el carácter que enfrenta los grandes retos.', category: 'growth', levelRequired: 1 },
  // Nivel 3
  { quote: 'Sufre las incomodidades del entrenamiento o sufre las consecuencias del arrepentimiento.', category: 'health', levelRequired: 3 },
  { quote: 'El dinero es una herramienta. El dinero que no se mueve no trabaja para ti.', category: 'finance', levelRequired: 3 },
  { quote: 'Un libro te da acceso a décadas de experiencia de otra persona en horas.', category: 'mindset', levelRequired: 3 },
  { quote: 'Las relaciones son el activo más valioso que construirás en toda tu vida.', category: 'relationships', levelRequired: 3 },
  { quote: 'El modo difícil ahora es el modo fácil después.', category: 'discipline', levelRequired: 3 },
  // Nivel 5
  { quote: 'No hay atajos al lugar que vale la pena ir.', author: 'Beverly Sills', category: 'growth', levelRequired: 5 },
  { quote: 'Tu red neuronal se recablea con cada decisión repetida. Cada hábito es una autopista que construyes.', category: 'mindset', levelRequired: 5 },
  { quote: 'La disciplina es elegir lo que quieres más sobre lo que quieres ahora.', category: 'discipline', levelRequired: 5 },
  { quote: 'Cuida tu cuerpo. Es el único lugar que tienes para vivir.', author: 'Jim Rohn', category: 'health', levelRequired: 5 },
  { quote: 'La riqueza no es tener todo lo que quieres. Es no necesitar nada de lo que no tienes.', category: 'finance', levelRequired: 5 },
  // Nivel 8
  { quote: 'El compuesto no solo aplica al dinero. Aplica a la sabiduría, las relaciones y los hábitos.', category: 'growth', levelRequired: 8 },
  { quote: 'Busca primero entender, luego ser entendido.', author: 'Stephen Covey', category: 'relationships', levelRequired: 8 },
  { quote: 'La mente que se abre a una nueva idea nunca vuelve a su tamaño original.', author: 'Albert Einstein', category: 'mindset', levelRequired: 8 },
  { quote: 'No midas tu riqueza en dinero. Mídela en tiempo libre y paz mental.', category: 'finance', levelRequired: 8 },
  { quote: 'La mejor versión de ti mismo existe. Tu trabajo es presentarte cada día hasta que aparezca.', category: 'growth', levelRequired: 8 },
  // Nivel 12
  { quote: 'El estoico no evita el dolor. Aprende que el dolor no es el enemigo — la rendición sí.', author: 'Marco Aurelio', category: 'mindset', levelRequired: 12 },
  { quote: 'Prefiero fallar haciendo algo grande que tener éxito haciendo algo pequeño.', category: 'growth', levelRequired: 12 },
  { quote: 'El tiempo dedicado a las relaciones importantes es siempre tiempo bien invertido.', category: 'relationships', levelRequired: 12 },
  { quote: 'Sé el tipo de persona con quien quisieras trabajar, vivir y amar.', category: 'relationships', levelRequired: 12 },
  { quote: 'La libertad financiera no es lujo — es la fundación de todas las demás libertades.', category: 'finance', levelRequired: 12 },
  { quote: 'El dolor que sientes hoy es la fuerza que sentirás mañana.', category: 'health', levelRequired: 12 },
];

export async function seedWisdomCards() {
  const count = await prisma.wisdomCard.count();
  if (count > 0) return;
  await prisma.wisdomCard.createMany({ data: WISDOM_SEED });
}

export async function getDailyCard(userLevel: number) {
  const available = await prisma.wisdomCard.findMany({
    where: { levelRequired: { lte: userLevel } },
  });
  if (available.length === 0) return null;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return available[dayOfYear % available.length];
}

export async function listAvailableCards(userLevel: number) {
  return prisma.wisdomCard.findMany({
    where: { levelRequired: { lte: userLevel } },
    orderBy: [{ levelRequired: 'asc' }, { category: 'asc' }],
  });
}

export async function listLockedCards(userLevel: number) {
  return prisma.wisdomCard.findMany({
    where: { levelRequired: { gt: userLevel } },
    select: { id: true, category: true, levelRequired: true },
    orderBy: { levelRequired: 'asc' },
  });
}
