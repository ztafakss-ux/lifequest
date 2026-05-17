import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipBack, Play, Pause, SkipForward, Heart, Volume2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as spotifyService from '../../services/spotify.service';
import type { NowPlaying } from '../../services/spotify.service';

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

interface Props {
  connected: boolean;
}

export function SpotifyPlayer({ connected }: Props) {
  const navigate = useNavigate();
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [liked, setLiked] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showVolume, setShowVolume] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seekingRef = useRef(false);

  const fetchNowPlaying = useCallback(async () => {
    if (!connected) return;
    try {
      const data = await spotifyService.getNowPlaying();
      setNowPlaying(data);
    } catch {
      setNowPlaying(null);
    }
  }, [connected]);

  useEffect(() => {
    fetchNowPlaying();
    pollRef.current = setInterval(fetchNowPlaying, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNowPlaying]);

  const handlePlay = async () => {
    try {
      if (nowPlaying?.playing) await spotifyService.pause();
      else await spotifyService.play();
      setTimeout(fetchNowPlaying, 300);
    } catch { /* graceful fail */ }
  };

  const handleNext = async () => {
    try { await spotifyService.next(); setTimeout(fetchNowPlaying, 500); } catch { /* */ }
  };

  const handlePrev = async () => {
    try { await spotifyService.previous(); setTimeout(fetchNowPlaying, 500); } catch { /* */ }
  };

  const handleLike = async () => {
    try {
      await spotifyService.likeCurrentTrack();
      setLiked(true);
      setTimeout(() => setLiked(false), 3000);
    } catch { /* */ }
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!nowPlaying?.durationMs || seekingRef.current) return;
    seekingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const posMs = Math.round(pct * nowPlaying.durationMs);
    try { await spotifyService.seek(posMs); setTimeout(fetchNowPlaying, 400); } catch { /* */ }
    setTimeout(() => { seekingRef.current = false; }, 500);
  };

  const handleVolume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    try { await spotifyService.setVolume(vol); } catch { /* */ }
  };

  if (!connected) {
    return (
      <button
        onClick={() => navigate('/settings/integrations')}
        className="hidden md:flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent-green)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Music size={13} />
        Conecta Spotify
      </button>
    );
  }

  if (!nowPlaying || !nowPlaying.playing) {
    return (
      <div className="hidden md:flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-1 text-[var(--text-secondary)]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          className="p-1 hover:text-[var(--accent-green)] transition-colors"
          title="Anterior"
        >
          <SkipBack size={14} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePlay}
          className="p-1 hover:text-[var(--accent-green)] transition-colors"
          title="Reproducir"
        >
          <Play size={14} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="p-1 hover:text-[var(--accent-green)] transition-colors"
          title="Siguiente"
        >
          <SkipForward size={14} />
        </motion.button>
      </div>
    );
  }

  const pct = nowPlaying.progressMs && nowPlaying.durationMs
    ? (nowPlaying.progressMs / nowPlaying.durationMs) * 100
    : 0;

  return (
    <div className="hidden md:flex flex-col gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-1.5 min-w-0 max-w-[260px]">
      {/* Top row: art + track info + controls */}
      <div className="flex items-center gap-2">
        {nowPlaying.albumArt ? (
          <img
            src={nowPlaying.albumArt}
            alt="Album"
            className="w-8 h-8 rounded-md flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-[var(--bg-panel-light)] flex items-center justify-center flex-shrink-0">
            <Music size={14} className="text-[var(--text-muted)]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">
            {nowPlaying.track ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] truncate leading-tight">
            {nowPlaying.artist ?? '—'}
          </p>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handlePrev}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            <SkipBack size={13} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handlePlay}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            {nowPlaying.playing ? <Pause size={13} /> : <Play size={13} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleNext}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            <SkipForward size={13} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={`p-1 transition-colors ${liked ? 'text-[var(--accent-pink)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-pink)]'}`}
          >
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
          </motion.button>
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Volume2 size={12} />
            </motion.button>
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                  className="absolute bottom-full right-0 mb-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg p-2 shadow-lg z-10"
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={handleVolume}
                    className="w-20 accent-[var(--accent-green)]"
                    style={{ writingMode: 'horizontal-tb' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
          {nowPlaying.progressMs ? formatMs(nowPlaying.progressMs) : '0:00'}
        </span>
        <div
          className="flex-1 h-1 bg-[var(--bg-deep)] rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[var(--accent-green)] rounded-full transition-all group-hover:bg-[var(--accent-green)] relative"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
          {nowPlaying.durationMs ? formatMs(nowPlaying.durationMs) : '0:00'}
        </span>
      </div>
    </div>
  );
}
