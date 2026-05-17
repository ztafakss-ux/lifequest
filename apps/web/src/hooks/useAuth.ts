import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/auth.service';

/**
 * Al montar, intenta recuperar la sesión del usuario usando el refresh token
 * almacenado en la httpOnly cookie. Si falla, el usuario no está autenticado.
 */
export function useBootstrapAuth() {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { user, accessToken } = await authService.refreshToken();
        if (!cancelled) setAuth(user, accessToken);
      } catch {
        if (!cancelled) logout();
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [setAuth, logout]);
}
