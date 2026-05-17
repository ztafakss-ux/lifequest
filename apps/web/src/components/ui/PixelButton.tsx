import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../../lib/audio';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'cyan' | 'green';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[var(--text-primary)] text-[var(--bg-deep)] border border-[var(--text-primary)] font-bold',
  secondary: 'bg-[var(--accent-blue)] text-white border border-[var(--accent-blue)]',
  danger:    'bg-[var(--accent-red)] text-white',
  ghost:     'bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-secondary)]',
  cyan:      'bg-[var(--accent-cyan)] text-white',
  green:     'bg-[var(--accent-green)] text-white',
};

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

// 3-layer feedback: press down → brighten → settle
const tapSequence = {
  press:   { scale: 0.94, x: 1, y: 1, boxShadow: 'none', filter: 'brightness(0.9)' },
  confirm: { scale: 1.03, x: 0, y: 0, filter: 'brightness(1.25)' },
  rest:    { scale: 1,    x: 0, y: 0, filter: 'brightness(1)' },
};

export function PixelButton({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  loading,
  disabled,
  className = '',
  onClick,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  const [tapPhase, setTapPhase] = useState<'idle' | 'press' | 'confirm' | 'rest'>('idle');

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return;
    audio.play('blip');

    // Layer 1: immediate press
    setTapPhase('press');
    // Layer 2: confirm flash
    setTimeout(() => setTapPhase('confirm'), 80);
    // Layer 3: settle
    setTimeout(() => { setTapPhase('rest'); setTimeout(() => setTapPhase('idle'), 80); }, 180);

    onClick?.(e);
  }

  const animProps = tapPhase !== 'idle' ? tapSequence[tapPhase as keyof typeof tapSequence] : {};

  return (
    <motion.button
      animate={animProps}
      whileHover={isDisabled ? {} : { y: -1, filter: 'brightness(1.03)' }}
      onMouseEnter={() => { if (!isDisabled) audio.play('hover'); }}
      transition={{ duration: 0.08 }}
      className={[
        'font-sans font-semibold rounded-xl transition-colors duration-75 shadow-sm',
        'select-none cursor-pointer relative overflow-hidden',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      disabled={isDisabled}
      onClick={handleClick}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {/* Inner shimmer on confirm */}
      {tapPhase === 'confirm' && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.25)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-current animate-bounce" />
          <span className="inline-block w-2 h-2 bg-current animate-bounce [animation-delay:0.1s]" />
          <span className="inline-block w-2 h-2 bg-current animate-bounce [animation-delay:0.2s]" />
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
