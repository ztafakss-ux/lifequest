import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onDone: () => void;
}

const LOGO_LETTERS = 'LIFEQUEST'.split('');

function PixelStar({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute bg-white"
      style={{ width: 1, height: 1, ...style }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, style.opacity as number, (style.opacity as number) * 0.4] }}
      transition={{
        delay: (style.left as number) / 2000,
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    />
  );
}

// Pre-generate star positions so they're stable across renders
const STARS = Array.from({ length: 80 }, (_, i) => ({
  left: (i * 37 + 17) % 100,
  top: (i * 53 + 23) % 100,
  opacity: 0.2 + ((i * 13) % 60) / 100,
  size: i % 7 === 0 ? 2 : 1,
}));

function SplashMiguel() {
  return (
    <motion.div
      animate={{ scaleY: [1, 0.97, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="64" height="80" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
        <rect x="10" y="2" width="12" height="4" fill="#2c1810" />
        <rect x="9" y="3" width="1" height="6" fill="#2c1810" />
        <rect x="22" y="3" width="1" height="6" fill="#2c1810" />
        <rect x="10" y="6" width="12" height="10" fill="#c68642" />
        <rect x="12" y="9" width="2" height="2" fill="#1a1033" />
        <rect x="18" y="9" width="2" height="2" fill="#1a1033" />
        <rect x="13" y="9" width="1" height="1" fill="white" />
        <rect x="19" y="9" width="1" height="1" fill="white" />
        <rect x="13" y="13" width="6" height="1" fill="#8b4513" />
        <rect x="14" y="14" width="4" height="1" fill="#c0392b" />
        <rect x="14" y="16" width="4" height="2" fill="#c68642" />
        <rect x="9" y="18" width="14" height="10" fill="#4d96ff" />
        <rect x="5" y="18" width="4" height="8" fill="#4d96ff" />
        <rect x="23" y="18" width="4" height="8" fill="#4d96ff" />
        <rect x="5" y="26" width="4" height="3" fill="#c68642" />
        <rect x="23" y="26" width="4" height="3" fill="#c68642" />
        <rect x="9" y="28" width="14" height="2" fill="#5d4037" />
        <rect x="14" y="28" width="4" height="2" fill="#ffd23f" />
        <rect x="9" y="30" width="6" height="8" fill="#37474f" />
        <rect x="17" y="30" width="6" height="8" fill="#37474f" />
        <rect x="15" y="30" width="2" height="6" fill="#1a1033" />
        <rect x="8" y="37" width="7" height="3" fill="#212121" />
        <rect x="17" y="37" width="7" height="3" fill="#212121" />
      </svg>
    </motion.div>
  );
}

export function SplashScreen({ onDone }: Props) {
  const [lettersShown, setLettersShown] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [showSprite, setShowSprite] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [barPct, setBarPct] = useState(0);
  const [canHide, setCanHide] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    const letters = ['L', 'i', 'f', 'e', 'Q', 'u', 'e', 's', 't'];
    let letterIndex = 0;

    // Type letters at 120ms each — 9 letters = 1080ms total
    const typeInterval = setInterval(() => {
      if (letterIndex < letters.length) {
        letterIndex++;
        setLettersShown(letterIndex);
      } else {
        clearInterval(typeInterval);
      }
    }, 120);

    t.push(setTimeout(() => setShowTagline(true), 1300));
    t.push(setTimeout(() => setShowSprite(true), 1600));
    t.push(setTimeout(() => setShowBar(true), 1850));

    // Minimum 2.8s before hiding
    t.push(setTimeout(() => setCanHide(true), 2800));

    // Safety net: force exit after 4s no matter what
    t.push(setTimeout(() => {
      setBarPct(100);
      setCanHide(true);
    }, 4000));

    // Fill bar slowly — targets ~2.2s to reach 100%
    let pct = 0;
    const barInterval = setInterval(() => {
      pct = Math.min(100, pct + Math.random() * 7 + 3);
      setBarPct(Math.floor(pct));
      if (pct >= 100) clearInterval(barInterval);
    }, 150);

    return () => {
      t.forEach(clearTimeout);
      clearInterval(typeInterval);
      clearInterval(barInterval);
    };
  }, []);

  // Exit when both conditions are met: min time passed + bar full
  useEffect(() => {
    if (canHide && barPct >= 100) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onDone, 450);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [canHide, barPct, onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #221045 0%, #0d0620 100%)', zIndex: 300 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45 }}
        >
          {/* Star field */}
          <div className="absolute inset-0 pointer-events-none">
            {STARS.map((s, i) => (
              <PixelStar
                key={i}
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  opacity: s.opacity,
                  width: s.size,
                  height: s.size,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8">
            {/* LIFEQUEST logo letter by letter */}
            <div
              className="font-pixel flex gap-0.5"
              style={{
                fontSize: 'clamp(14px, 4vw, 24px)',
                letterSpacing: '3px',
                color: '#ffd23f',
                textShadow: '3px 3px 0 #0d0620, 0 0 24px rgba(255,210,63,0.45)',
              }}
            >
              {LOGO_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -12, scale: 0.6 }}
                  animate={lettersShown > i ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <AnimatePresence>
              {showTagline && (
                <motion.p
                  className="font-vt text-text-secondary text-center"
                  style={{ fontSize: '20px' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  La aventura de tu vida empieza hoy
                </motion.p>
              )}
            </AnimatePresence>

            {/* Miguel sprite */}
            <AnimatePresence>
              {showSprite && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <SplashMiguel />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <AnimatePresence>
              {showBar && (
                <motion.div
                  className="w-64"
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-pixel text-text-secondary" style={{ fontSize: '7px' }}>CARGANDO</span>
                    <span className="font-pixel text-accent-gold" style={{ fontSize: '7px' }}>{Math.floor(barPct)}%</span>
                  </div>
                  <div
                    className="border-2 border-accent-gold relative overflow-hidden"
                    style={{ height: '16px', background: 'rgba(0,0,0,0.5)' }}
                  >
                    <motion.div
                      className="h-full bg-accent-gold"
                      animate={{ width: `${barPct}%` }}
                      transition={{ ease: 'easeOut', duration: 0.15 }}
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.18) 10px, rgba(0,0,0,0.18) 12px)',
                      }}
                    />
                    {/* Scanline overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
