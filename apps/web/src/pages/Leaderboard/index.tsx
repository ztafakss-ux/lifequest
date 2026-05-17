import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Dumbbell, PiggyBank, Users, Globe } from 'lucide-react';
import { getLeaderboard } from '../../services/social.service';
import { useAuthStore } from '../../store/authStore';

type Category = 'xp' | 'streak' | 'gym' | 'savings';

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  level: number;
  value: number;
  avatarConfig?: unknown;
}

const CATEGORIES: Array<{ id: Category; label: string; icon: React.ReactNode; unit: string }> = [
  { id: 'xp',      label: 'XP Total',    icon: <Trophy size={16} />,   unit: 'XP' },
  { id: 'streak',  label: 'Racha Activa', icon: <Flame size={16} />,    unit: 'días' },
  { id: 'gym',     label: 'Gym',          icon: <Dumbbell size={16} />, unit: 'sesiones' },
  { id: 'savings', label: 'Ahorro',       icon: <PiggyBank size={16} />, unit: '%' },
];

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];
const RANK_EMOJI  = ['👑', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<Category>('xp');
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(category, friendsOnly)
      .then((d) => setData(d as LeaderboardEntry[]))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [category, friendsOnly]);

  const myRank = data.findIndex((e) => e.id === user?.id) + 1;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-accent-gold" size={28} />
        <h1 className="font-pixel text-accent-gold" style={{ fontSize: '16px' }}>
          TABLA DE LÍDERES
        </h1>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setFriendsOnly(false)}
          className={`flex items-center gap-1 px-3 py-2 border-2 font-pixel transition-colors ${
            !friendsOnly ? 'bg-accent-gold text-bg-deep border-accent-gold' : 'border-border-pixel text-text-dim hover:text-text-primary'
          }`}
          style={{ fontSize: '9px' }}
        >
          <Globe size={12} /> Global
        </button>
        <button
          onClick={() => setFriendsOnly(true)}
          className={`flex items-center gap-1 px-3 py-2 border-2 font-pixel transition-colors ${
            friendsOnly ? 'bg-accent-gold text-bg-deep border-accent-gold' : 'border-border-pixel text-text-dim hover:text-text-primary'
          }`}
          style={{ fontSize: '9px' }}
        >
          <Users size={12} /> Amigos
        </button>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-4 gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex flex-col items-center gap-1 p-2 border-2 font-pixel transition-all ${
              category === cat.id
                ? 'bg-bg-panel border-accent-gold text-accent-gold'
                : 'border-border-pixel text-text-dim hover:border-text-dim'
            }`}
            style={{ fontSize: '8px' }}
          >
            {cat.icon}
            <span className="hidden sm:block">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* My position banner */}
      {myRank > 0 && (
        <div className="bg-bg-panel border-2 border-accent-gold px-4 py-2 flex items-center justify-between">
          <span className="font-vt text-text-primary text-sm">Tu posición:</span>
          <span className="font-pixel text-accent-gold" style={{ fontSize: '12px' }}>
            #{myRank}
          </span>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-bg-panel border-4 border-border-pixel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-vt text-text-dim animate-pulse">Cargando...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center font-vt text-text-dim">
            No hay datos todavía. ¡Sé el primero!
          </div>
        ) : (
          <div className="divide-y-2 divide-border-pixel">
            {data.slice(0, 50).map((entry, i) => {
              const isMe = entry.id === user?.id;
              const rankColor = RANK_COLORS[i] ?? 'transparent';
              const catInfo = CATEGORIES.find((c) => c.id === category)!;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-accent-gold/10' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span style={{ fontSize: '18px' }}>{RANK_EMOJI[i]}</span>
                    ) : (
                      <span
                        className="font-pixel"
                        style={{ fontSize: '10px', color: rankColor || '#6b7280' }}
                      >
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar placeholder */}
                  <div
                    className="w-10 h-10 border-2 flex items-center justify-center font-pixel text-xs flex-shrink-0"
                    style={{ borderColor: rankColor || '#374151', background: '#1a1a2e' }}
                  >
                    {(entry.displayName ?? entry.username).charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-pixel truncate ${isMe ? 'text-accent-gold' : 'text-text-primary'}`} style={{ fontSize: '10px' }}>
                      {entry.displayName}
                      {isMe && ' (tú)'}
                    </div>
                    <div className="font-vt text-text-dim text-xs">@{entry.username} · Nv.{entry.level}</div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <div className="font-pixel text-accent-gold" style={{ fontSize: '11px' }}>
                      {entry.value.toLocaleString()}
                    </div>
                    <div className="font-vt text-text-dim" style={{ fontSize: '10px' }}>
                      {catInfo.unit}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
