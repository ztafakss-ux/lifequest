import type { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'light' | 'gold' | 'dark';
  animate?: boolean;
}

const variantClasses = {
  default: 'bg-[var(--bg-panel)] border border-[var(--border)]',
  light:   'bg-[var(--bg-panel-light)] border border-[var(--border)]',
  gold:    'bg-[var(--bg-panel)] border border-[var(--accent-gold)]',
  dark:    'bg-[var(--bg-panel)] border border-[var(--border-strong)]',
};

export function PixelPanel({ children, title, variant = 'default', animate = false, className = '', ...props }: Props) {
  const baseClass = [variantClasses[variant], 'rounded-2xl shadow-sm hover:shadow-md transition-shadow relative', className].join(' ');

  const inner = (
    <>
      {title && (
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
      )}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.div className={baseClass} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} {...(props as any)}>
        {inner}
      </motion.div>
    );
  }

  return <div className={baseClass} {...props}>{inner}</div>;
}
