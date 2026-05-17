import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Swords, Wallet, Flame, NotebookPen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { icon: <Swords size={16} />, label: 'Nueva Quest', to: '/quests?new=1', color: 'var(--accent-gold)' },
  { icon: <Wallet size={16} />, label: 'Registrar gasto', to: '/finances?new=1', color: 'var(--accent-green)' },
  { icon: <Flame size={16} />, label: 'Marcar hábito', to: '/habits', color: 'var(--accent-red)' },
  { icon: <NotebookPen size={16} />, label: 'Nota rápida', to: '/journal?new=1', color: 'var(--accent-cyan)' },
];

export function QuickActionsFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-24 right-4 md:bottom-24 md:right-8 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <>
            {ACTIONS.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
                className="flex items-center gap-2"
              >
                <span className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm whitespace-nowrap">
                  {action.label}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { navigate(action.to); setOpen(false); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-[var(--border)] bg-[var(--bg-panel)]"
                  style={{ color: action.color }}
                >
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X size={20} /> : <Plus size={20} />}
        </motion.div>
      </motion.button>
    </div>
  );
}
