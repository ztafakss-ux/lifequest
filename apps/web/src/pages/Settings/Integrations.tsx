import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { PixelPanel } from '../../components/ui/PixelPanel';
import { PixelButton } from '../../components/ui/PixelButton';
import { CalendarDays, Music, Activity, Check } from 'lucide-react';

interface Status {
  googleCalendar: boolean;
  spotify: boolean;
  googleFit: boolean;
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

function IntegrationCard({
  icon,
  title,
  description,
  connected,
  onConnect,
  onSync,
  onDisconnect,
  syncing,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  onConnect: () => void;
  onSync?: () => void;
  onDisconnect: () => void;
  syncing?: boolean;
}) {
  return (
    <PixelPanel className="p-4">
      <div className="flex items-start gap-4">
        <div className={`p-2 border-2 border-border-pixel flex-shrink-0 ${connected ? 'bg-accent-green/10 border-accent-green' : 'bg-bg-deep'}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-pixel text-text-primary" style={{ fontSize: '9px' }}>{title}</p>
            {connected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-accent-green/20 border border-accent-green px-2 py-0.5"
              >
                <Check size={10} className="text-[var(--accent-green)]" />
                <span className="font-pixel text-accent-green" style={{ fontSize: '7px' }}>CONECTADO</span>
              </motion.div>
            )}
          </div>
          <p className="font-vt text-text-secondary text-base mt-1">{description}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        {!connected ? (
          <PixelButton variant="primary" onClick={onConnect} className="text-xs">
            Conectar
          </PixelButton>
        ) : (
          <>
            {onSync && (
              <PixelButton variant="secondary" onClick={onSync} disabled={syncing} className="text-xs">
                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </PixelButton>
            )}
            <PixelButton variant="ghost" onClick={onDisconnect} className="text-xs text-accent-red border-accent-red">
              Desconectar
            </PixelButton>
          </>
        )}
      </div>
    </PixelPanel>
  );
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<Status>({ googleCalendar: false, spotify: false, googleFit: false });
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api.get<Status>('/integrations/status').then((r) => setStatus(r.data)).catch(() => null);
  }, []);

  useEffect(() => {
    const google    = searchParams.get('google');
    const spotify   = searchParams.get('spotify');
    const googlefit = searchParams.get('googlefit');

    if (google === 'connected')    { setToast('¡Google Calendar conectado!'); setStatus((s) => ({ ...s, googleCalendar: true })); }
    if (spotify === 'connected')   { setToast('¡Spotify conectado!');        setStatus((s) => ({ ...s, spotify: true })); }
    if (googlefit === 'connected') { setToast('¡Google Fit conectado!');     setStatus((s) => ({ ...s, googleFit: true })); }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const syncGoogle = async () => {
    setSyncing((s) => ({ ...s, google: true }));
    try {
      const r = await api.post<{ synced: number }>('/integrations/google/sync') as { data: { synced: number } };
      setToast(`✅ ${r.data.synced} misiones sincronizadas con Google Calendar`);
    } catch {
      setToast('❌ Error al sincronizar');
    } finally {
      setSyncing((s) => ({ ...s, google: false }));
    }
  };

  const disconnect = async (service: string, endpoint: string) => {
    try {
      await api.delete(endpoint);
      setStatus((s) => ({ ...s, [service]: false }));
      setToast('Desconectado correctamente');
    } catch {
      setToast('Error al desconectar');
    }
  };

  const connectRedirect = (path: string) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setToast('❌ Debes iniciar sesión primero');
      return;
    }
    window.location.href = `${BASE}${path}?token=${encodeURIComponent(token)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pixel text-accent-gold" style={{ fontSize: '12px' }}>INTEGRACIONES</h1>
        <p className="font-vt text-text-secondary text-lg mt-1">
          Conecta tus herramientas favoritas con LifeQuest.
        </p>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-bg-panel border-2 border-accent-gold p-3 font-vt text-text-primary text-lg"
        >
          {toast}
        </motion.div>
      )}

      <div className="space-y-4">
        <IntegrationCard
          icon={<CalendarDays size={28} className={status.googleCalendar ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]'} />}
          title="Google Calendar"
          description="Sincroniza tus quests con deadline en Google Calendar como eventos. Nunca te pierdas una misión importante."
          connected={status.googleCalendar}
          onConnect={() => connectRedirect('/integrations/google/auth')}
          onSync={syncGoogle}
          onDisconnect={() => disconnect('googleCalendar', '/integrations/google/disconnect')}
          syncing={syncing.google}
        />

        <IntegrationCard
          icon={<Music size={28} className={status.spotify ? 'text-[#1DB954]' : 'text-[var(--text-secondary)]'} />}
          title="Spotify"
          description="Activa el modo entrenamiento para escuchar tu playlist de gym al iniciar un workout en el Coliseo."
          connected={status.spotify}
          onConnect={() => connectRedirect('/integrations/spotify/auth')}
          onDisconnect={() => disconnect('spotify', '/integrations/spotify/disconnect')}
        />

        <IntegrationCard
          icon={<Activity size={28} className={status.googleFit ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'} />}
          title="Google Fit"
          description="Importa automáticamente pasos, calorías y datos de sueño de tu wearable para llenar la Torre del Sueño y el Coliseo."
          connected={status.googleFit}
          onConnect={() => connectRedirect('/integrations/googlefit/auth')}
          onDisconnect={() => disconnect('googleFit', '/integrations/googlefit/disconnect')}
        />
      </div>
    </div>
  );
}
