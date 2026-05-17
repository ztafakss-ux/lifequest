import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Zap, Star, Trophy, ArrowUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

interface GlowUpData {
  user: {
    displayName: string;
    level: number;
    currentStreak: number;
    longestStreak: number;
    createdAt: string;
    strength: number;
    intelligence: number;
    charisma: number;
  };
  stats: {
    totalQuestsCompleted: number;
    totalHabitsLogged: number;
    totalXpEarned: number;
    totalWorkouts: number;
    totalFocusMinutes: number;
    startLevel: number;
  };
  milestones: {
    label: string;
    date: string;
    icon: string;
    type: 'level' | 'streak' | 'quest' | 'habit';
  }[];
  bodyWeights: { weight: number; date: string }[];
  projection: string | null;
}

function StatComparison({ label, before, after, unit = '', color }: {
  label: string; before: string | number; after: string | number; unit?: string; color: string;
}) {
  const improved = Number(after) > Number(before);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
          <p className="text-lg font-bold text-[var(--text-muted)]">{before}{unit}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Inicio</p>
        </div>
        <div className="flex flex-col items-center">
          <ArrowUp size={16} style={{ color, opacity: improved ? 1 : 0.3 }} />
        </div>
        <div className="flex-1 p-3 rounded-xl text-center" style={{ background: color + '22' }}>
          <p className="text-lg font-bold" style={{ color }}>{after}{unit}</p>
          <p className="text-[10px]" style={{ color, opacity: 0.7 }}>Ahora</p>
        </div>
      </div>
    </div>
  );
}

const MILESTONE_ICONS: Record<string, string> = {
  level: '⭐',
  streak: '🔥',
  quest: '⚔️',
  habit: '💎',
};

function Timeline({ milestones }: { milestones: GlowUpData['milestones'] }) {
  return (
    <div className="relative pl-8 space-y-6">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--accent-gold)] via-[var(--accent-cyan)] to-transparent" />
      {milestones.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          <div
            className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-panel)', border: '2px solid var(--accent-gold)' }}
          >
            {m.icon || MILESTONE_ICONS[m.type] || '📌'}
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(m.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function GlowUpPage() {
  const [data, setData] = useState<GlowUpData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function load() {
      try {
        const { data: d } = await api.get('/life/glow-up');
        setData(d);
      } catch {
        // build from user data
        if (user) {
          setData({
            user: {
              displayName: user.displayName,
              level: user.level,
              currentStreak: user.currentStreak,
              longestStreak: user.longestStreak,
              createdAt: user.createdAt ?? new Date().toISOString(),
              strength: user.strength,
              intelligence: user.intelligence,
              charisma: user.charisma,
            },
            stats: {
              totalQuestsCompleted: 0,
              totalHabitsLogged: 0,
              totalXpEarned: user.xp,
              totalWorkouts: 0,
              totalFocusMinutes: (user as any).focusMinutesTotal ?? 0,
              startLevel: 1,
            },
            milestones: [
              { label: 'Comenzaste tu aventura', date: user.createdAt ?? new Date().toISOString(), icon: '🏁', type: 'level' },
            ],
            bodyWeights: [],
            projection: null,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={32} className="animate-spin text-[var(--accent-gold)]" />
      </div>
    );
  }

  if (!data) return null;

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(data.user.createdAt).getTime()) / 86400000
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Zap className="text-[var(--accent-gold)]" size={24} />
          El Espejo
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {data.user.displayName} — {daysSinceStart} días de transformación
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nivel', value: data.user.level, icon: <Star size={16} />, color: 'var(--accent-gold)' },
          { label: 'Racha actual', value: `${data.user.currentStreak}d`, icon: <TrendingUp size={16} />, color: 'var(--accent-cyan)' },
          { label: 'XP ganado', value: data.stats.totalXpEarned.toLocaleString(), icon: <Zap size={16} />, color: 'var(--accent-green)' },
          { label: 'Días activo', value: daysSinceStart, icon: <Calendar size={16} />, color: 'var(--accent-pink)' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 text-center"
            style={{ borderColor: s.color + '44' }}
          >
            <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Antes vs Ahora */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-6">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--accent-cyan)]" />
          Antes vs Ahora
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatComparison
            label="Nivel" before={data.stats.startLevel} after={data.user.level}
            color="var(--accent-gold)"
          />
          <StatComparison
            label="Racha máxima" before={0} after={data.user.longestStreak}
            unit="d" color="var(--accent-cyan)"
          />
          <StatComparison
            label="Fuerza" before={1} after={data.user.strength}
            color="var(--accent-pink)"
          />
          <StatComparison
            label="Inteligencia" before={1} after={data.user.intelligence}
            color="var(--accent-green)"
          />
          {data.stats.totalWorkouts > 0 && (
            <StatComparison
              label="Entrenamientos" before={0} after={data.stats.totalWorkouts}
              color="var(--accent-pink)"
            />
          )}
          {data.stats.totalFocusMinutes > 0 && (
            <StatComparison
              label="Min de enfoque" before={0} after={data.stats.totalFocusMinutes}
              color="var(--accent-cyan)"
            />
          )}
        </div>
      </div>

      {/* Actividad total */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Misiones completadas', value: data.stats.totalQuestsCompleted, icon: '⚔️' },
          { label: 'Hábitos registrados', value: data.stats.totalHabitsLogged, icon: '💎' },
          { label: 'Entrenamientos', value: data.stats.totalWorkouts, icon: '🏋️' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{s.value.toLocaleString()}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {data.milestones.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <Calendar size={18} className="text-[var(--accent-gold)]" />
            El Camino Recorrido
          </h2>
          <Timeline milestones={data.milestones} />
        </div>
      )}

      {/* Proyección */}
      {data.projection && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold)22, var(--accent-cyan)11)',
            border: '1px solid var(--accent-gold)44',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} className="text-[var(--accent-gold)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Proyección del Sabio</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{data.projection}</p>
        </motion.div>
      )}
    </div>
  );
}
