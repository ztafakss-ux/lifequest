# 🎵 Configuración de Spotify

LifeQuest permite conectar tu cuenta de Spotify para escuchar música durante tus workouts en el Coliseo.

## Paso 1: Crear una aplicación en Spotify Developer

1. Accede a https://developer.spotify.com/dashboard
2. Inicia sesión con tu cuenta de Spotify (crea una si no tienes)
3. Haz clic en "Create an App"
4. Acepta los términos y nombre tu app: `LifeQuest` (o el nombre que prefieras)
5. Completa el formulario y crea la aplicación

## Paso 2: Obtener credenciales

Una vez creada la app, verás:
- **Client ID** — cópialo
- **Client Secret** — haz clic en "Show Client Secret" y cópialo

## Paso 3: Configurar Redirect URI

1. En el dashboard de tu app, haz clic en "Edit Settings"
2. Ve a la sección "Redirect URIs"
3. Agrega estas URLs según tu entorno:
   - **Local**: `http://localhost:3001/api/v1/integrations/spotify/callback`
   - **Producción**: `https://tu-dominio.com/api/v1/integrations/spotify/callback`
4. Guarda los cambios

## Paso 4: Agregar variables de entorno

En tu archivo `apps/api/.env`, agrega:

```env
SPOTIFY_CLIENT_ID="tu-client-id-aqui"
SPOTIFY_CLIENT_SECRET="tu-client-secret-aqui"
SPOTIFY_REDIRECT_URI="http://localhost:3001/api/v1/integrations/spotify/callback"
```

Para el frontend en `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

## Paso 5: Reiniciar el servidor

```bash
npm run dev
```

## Uso en la app

1. Ve a **Configuración → Integraciones**
2. Haz clic en "Conectar" en la tarjeta de Spotify
3. Autoriza el acceso a tu cuenta
4. Una vez conectado, podrás:
   - Escuchar música durante workouts
   - Ver la canción actual que estás reproduciendo
   - Cambiar de canción desde la app

## Troubleshooting

### Error: "SPOTIFY_CLIENT_ID no configurado"
→ Verifica que las variables estén en `apps/api/.env` y que el servidor fue reiniciado

### Error: "Token de acceso requerido"
→ Asegúrate de estar autenticado en LifeQuest. Si persiste, limpia localStorage y vuelve a iniciar sesión

### Error: "Invalid redirect URI"
→ Verifica que la URL en tu `.env` coincida exactamente con la registrada en Spotify Developer

### No puedo autorizar en Spotify
→ Verifica que tu cuenta de Spotify sea válida (gratuita o premium funciona)
→ Si usas contraseña, asegúrate de que no haya caracteres especiales que causen problemas

## Scopes solicitados

LifeQuest solicita los siguientes permisos a Spotify:
- `user-read-currently-playing` — Ver canción actual
- `user-read-playback-state` — Ver estado de reproducción
- `user-modify-playback-state` — Controlar reproducción (requiere Premium para play/pause/skip)
- `playlist-read-private` — Ver playlists privadas
- `user-library-modify` — Guardar canciones en "Me gusta"
- `streaming` — Web Playback SDK

## Funciones disponibles con Spotify Premium

Con una cuenta Premium, tienes control total de reproducción desde LifeQuest:
- ⏮ Anterior / ⏯ Play-Pausa / ⏭ Siguiente
- Barra de progreso clickeable (seek)
- Control de volumen
- Botón "Me gusta" para guardar canciones
- Mini-reproductor siempre visible en el header
- Actualizaciones automáticas cada 5 segundos
