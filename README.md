# ⚔️ LifeQuest — El RPG de tu vida real

Un organizador de vida gamificado con estética SNES/16-bit, construido con React + Vite + Node.js + PostgreSQL + Prisma.

---

## 🛠️ Requisitos previos

- Node.js 20+
- npm 9+
- PostgreSQL 15+ corriendo localmente

---

## 🚀 Setup inicial

### 1. Instalar dependencias

```bash
cd lifequest
npm install
```

### 2. Variables de entorno

```bash
# Copiar el template
cp .env.example apps/api/.env

# Editar apps/api/.env con tus valores:
# DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/lifequest"
# JWT_SECRET="un-secreto-largo-de-minimo-32-caracteres"
# REFRESH_TOKEN_SECRET="otro-secreto-distinto-de-32-caracteres"
```

Para el frontend, crear `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=LifeQuest
```

### 3. Crear la base de datos

```bash
# En PostgreSQL
createdb lifequest
# O desde psql: CREATE DATABASE lifequest;
```

### 4. Migraciones de Prisma

```bash
npm run db:migrate
# Acepta el nombre sugerido para la migración (ej: "init")
```

### 5. Seed (datos de prueba)

```bash
npm run db:seed
```

Esto crea el usuario de prueba:
- **Email**: `miguel@lifequest.com`
- **Password**: `test1234`
- **Nivel**: 7 con misiones, transacciones y logros ya cargados

---

## 🏃 Desarrollo

```bash
# Iniciar API + frontend simultáneamente
npm run dev
```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api/v1
- **Prisma Studio**: `npm run db:studio`

---

## 📁 Estructura

```
lifequest/
├── apps/
│   ├── api/          # Backend Express + Prisma
│   └── web/          # Frontend React + Vite
├── packages/
│   └── shared/       # Tipos TypeScript compartidos
└── package.json      # npm workspaces
```

---

## 🗺️ Rutas del juego

| Ruta | Zona |
|------|------|
| `/` | 🏰 El Castillo (Dashboard) |
| `/quests` | 📜 Misiones |
| `/gym` | ⚔️ El Coliseo |
| `/food` | 🍖 La Posada |
| `/sleep` | 🌙 La Torre del Sueño |
| `/finances` | 💰 La Bóveda |
| `/learning` | 📚 La Biblioteca |
| `/love` | 💖 El Jardín del Corazón |
| `/shop` | 🛒 El Mercado |
| `/journal` | 📓 El Diario |
| `/achievements` | 🏆 Logros |

---

## 🔑 API Endpoints (v1)

```
POST /api/v1/auth/register   — Crear cuenta
POST /api/v1/auth/login      — Iniciar sesión
POST /api/v1/auth/refresh    — Renovar access token
POST /api/v1/auth/logout     — Cerrar sesión
GET  /api/v1/auth/me         — Usuario actual
GET  /api/v1/health          — Health check
```

---

## 🎮 Usuario de prueba

```
Email:    miguel@lifequest.com
Password: test1234
Nivel:    7
Gold:     1,250
```

---

## 📦 Comandos útiles

```bash
npm run dev              # Iniciar desarrollo (API + Web)
npm run db:migrate       # Crear/aplicar migración
npm run db:seed          # Poblar con datos de prueba
npm run db:studio        # Abrir Prisma Studio (GUI de BD)
npm run build            # Compilar todo para producción
```
