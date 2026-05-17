import { motion } from 'framer-motion';

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; glow: boolean }> = {
  EASY:   { label: 'Fácil',  color: '#6bcf7f', glow: false },
  NORMAL: { label: 'Normal', color: '#4d96ff', glow: false },
  HARD:   { label: 'Difícil', color: '#9d4edd', glow: false },
  EPIC:   { label: 'ÉPICA',  color: '#ffd23f', glow: true },
};

interface Props {
  difficulty: string;
  showLabel?: boolean;
}

export function DifficultyBadge({ difficulty, showLabel = true }: Props) {
  const cfg = DIFFICULTY_CONFIG[difficulty] ?? { label: difficulty, color: '#888', glow: false };

  return (
    <motion.span
      className="font-pixel px-2 py-0.5 border-2 border-border-pixel inline-block"
      style={{
        fontSize: '7px',
        backgroundColor: cfg.color + '33',
        color: cfg.color,
        borderColor: cfg.color,
        boxShadow: cfg.glow ? `0 0 8px ${cfg.color}88` : undefined,
      }}
      animate={cfg.glow ? { boxShadow: [`0 0 6px ${cfg.color}66`, `0 0 14px ${cfg.color}cc`, `0 0 6px ${cfg.color}66`] } : {}}
      transition={cfg.glow ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {showLabel ? cfg.label : difficulty[0]}
    </motion.span>
  );
}

export { DIFFICULTY_CONFIG };
