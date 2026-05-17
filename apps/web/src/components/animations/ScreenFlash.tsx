import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

export function ScreenFlash() {
  const { isScreenFlashing, flashColor } = useUIStore();

  return (
    <AnimatePresence>
      {isScreenFlashing && (
        <motion.div
          className="fixed inset-0 z-[95] pointer-events-none"
          style={{ background: flashColor }}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
}
