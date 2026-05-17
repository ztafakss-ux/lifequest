import { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  displayName: string;
  currentStreak: number;
  createdAt: string;
  questsCompletedYesterday?: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getMotivationalPhrase(
  firstName: string,
  streak: number,
  questsYesterday: number,
  daysSinceJoin: number,
): string {
  if (streak >= 30) return `${streak} días invicto, ${firstName}. Eres una leyenda.`;
  if (streak >= 14) return `${streak} días de racha, ${firstName}. El reino entero te observa.`;
  if (streak >= 7)  return `${streak} días imparables, ${firstName}. El fuego no se apaga.`;
  if (questsYesterday > 0) return `Ayer conquistaste el día, héroe. ¿Qué harás hoy?`;
  if (daysSinceJoin <= 3)  return `Bienvenido al mundo de LifeQuest, ${firstName}. Tu leyenda comienza.`;
  return `La aventura continúa, ${firstName}. ¿A qué esperas?`;
}

const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export function GreetingHeader({ displayName, currentStreak, createdAt, questsCompletedYesterday = 0 }: Props) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  useEffect(() => {
    const main = parallaxRef.current?.closest('main');
    if (!main) return;
    const handleScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${main.scrollTop * 0.25}px)`;
      }
    };
    main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const { greeting, dateStr, daysSinceJoin, firstName, phrase } = useMemo(() => {
    const now   = new Date();
    const day   = DAYS_ES[now.getDay()];
    const date  = now.getDate();
    const month = MONTHS_ES[now.getMonth()];
    const join  = new Date(createdAt);
    const days  = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
    const first = displayName.split(' ')[0];
    return {
      greeting:      getGreeting(),
      dateStr:       `${day.charAt(0).toUpperCase() + day.slice(1)} ${date} de ${month}`,
      daysSinceJoin: days,
      firstName:     first,
      phrase:        getMotivationalPhrase(first, currentStreak, questsCompletedYesterday, days),
    };
  }, [displayName, currentStreak, createdAt, questsCompletedYesterday]);

  return (
    <div className="relative overflow-hidden rounded-xl mb-1" style={{ background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-purple) 100%)', minHeight: '120px' }}>
      {/* Parallax decorative layer */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />

      <motion.div
        className="relative p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-1">
          <h1 className="font-pixel text-white" style={{ fontSize: '13px', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
            {greeting}, {firstName} ⚔️
          </h1>
          <p className="font-vt text-white/80 text-xl">
            {dateStr} · Día {daysSinceJoin} en LifeQuest
          </p>
          <motion.p
            className="font-vt text-white/90 text-xl italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            "{phrase}"
          </motion.p>
        </div>

        {currentStreak > 0 && (
          <motion.div
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 self-start"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              🔥
            </motion.span>
            <div>
              <p className="font-pixel text-white/70" style={{ fontSize: '7px' }}>RACHA</p>
              <p className="font-vt text-white text-xl">{currentStreak} días</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
