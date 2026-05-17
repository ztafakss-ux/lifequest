import { motion } from 'framer-motion';
import type { HeatmapEntry } from '../../services/habit.service';

interface Props {
  entries: HeatmapEntry[];
  days?: number;
}

function getColor(entry: HeatmapEntry | undefined): string {
  if (!entry) return '#1a1033';
  if (entry.status === 'completed') return '#6bcf7f';
  if (entry.status === 'skipped') return '#ffd23f44';
  if (entry.status === 'failed') return '#ff4757';
  return '#1a1033';
}

export function HabitHeatmap({ entries, days = 30 }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split('T')[0];
    const isToday = i === days - 1;
    const isFuture = date > today;
    return { key, entry: entryMap.get(key), isToday, isFuture, date };
  });

  return (
    <div className="flex gap-0.5 flex-wrap">
      {cells.map(({ key, entry, isToday, isFuture }) => (
        <motion.div
          key={key}
          title={`${key}: ${entry?.status ?? (isFuture ? 'futuro' : 'sin registro')}`}
          className="w-3.5 h-3.5 border border-border-pixel/30 cursor-help"
          style={{
            backgroundColor: isFuture ? 'transparent' : getColor(entry),
            borderColor: isToday ? '#ffd23f' : undefined,
            borderWidth: isToday ? '2px' : undefined,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: Math.random() * 0.3 }}
        />
      ))}
    </div>
  );
}
