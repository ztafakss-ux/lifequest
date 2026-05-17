export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (s < 60)  return 'hace un momento';
  if (m < 60)  return `hace ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
  if (h < 24)  return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  if (d === 1) return 'ayer';
  if (d < 7)   return `hace ${d} días`;
  if (d < 14)  return 'hace una semana';
  if (d < 30)  return `hace ${Math.floor(d / 7)} semanas`;
  if (d < 365) return `hace ${Math.floor(d / 30)} ${Math.floor(d / 30) === 1 ? 'mes' : 'meses'}`;
  return `hace ${Math.floor(d / 365)} ${Math.floor(d / 365) === 1 ? 'año' : 'años'}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n);
}

export function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
