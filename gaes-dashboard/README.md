# GAES SEO Dashboard

Dashboard SEO para GAES en LATAM. React 19 + Vite en el cliente, Node.js + Express en el servidor. Integra DataForSEO Labs API para rankings, keyword ideas y SERP.

---

## Estructura del proyecto

```
gaes-dashboard/
├── client/          # React 19 + Vite + TailwindCSS
├── server/          # Node.js + Express
│   ├── routes/
│   │   ├── rankings.js   # POST /api/rankings/organic
│   │   └── keywords.js   # POST /api/keywords/ideas  POST /api/keywords/serp
│   ├── index.js          # Entry point
│   └── .env              # Variables de entorno (no commitear)
├── package.json          # Scripts raíz
└── .cpanel.yml           # Deploy automático en cPanel
```

---

## Desarrollo local

### Requisitos
- Node.js >= 18
- Credenciales DataForSEO en `server/.env`

### 1. Instalar dependencias

```bash
npm install --prefix client
npm install --prefix server
```

O con el script raíz:

```bash
npm run install:all
```

### 2. Configurar variables de entorno

Edita `server/.env`:

```env
DATAFORSEO_LOGIN=tu@email.com
DATAFORSEO_PASSWORD=tu_password
SERP_API_KEY=tu_api_key
PORT=3001
```

### 3. Iniciar en modo desarrollo

```bash
# Terminal 1 — servidor (con hot-reload)
cd server && npm run dev

# Terminal 2 — cliente Vite (proxy /api/* → puerto 3001)
cd client && npm run dev
```

El cliente corre en `http://localhost:5173` y redirige `/api/*` al servidor en `:3001`.

---

## Deploy en cPanel (Setup Node.js App)

### Paso 1 — Preparar el build localmente (o vía CI)

```bash
# Desde la raíz gaes-dashboard/
npm install --prefix client
npm install --prefix server
npm run build          # genera client/dist/
```

### Paso 2 — Subir archivos a cPanel

**Opción A — Git Version Control (recomendada)**

1. En cPanel > **Git Version Control** > **Create** → apunta al repositorio remoto
2. Activa **Automatic Deployment** para que se ejecute `.cpanel.yml` en cada push
3. Edita `.cpanel.yml` y cambia `DEPLOYPATH` por tu ruta real:
   ```yaml
   - export DEPLOYPATH=/home/TU_USUARIO/gaes-dashboard
   ```
4. Haz `git push` → cPanel ejecuta los tasks automáticamente

**Opción B — File Manager / FTP**

Sube toda la carpeta `gaes-dashboard/` (incluyendo `client/dist/` ya construido y `server/node_modules/`).

---

### Paso 3 — Configurar Setup Node.js App en cPanel

1. Ve a cPanel > **Setup Node.js App** > **Create Application**
2. Completa los campos:

   | Campo | Valor |
   |-------|-------|
   | Node.js version | 18.x o superior |
   | Application mode | Production |
   | Application root | `gaes-dashboard/` |
   | Application URL | Tu dominio o subdominio |
   | Application startup file | `server/index.js` |

3. Guarda la configuración.

---

### Paso 4 — Configurar variables de entorno en cPanel

En la misma pantalla de **Setup Node.js App** (o en el archivo `server/.env` si lo subiste manualmente), agrega:

```
DATAFORSEO_LOGIN    = raimundo.pino@amplifon.com
DATAFORSEO_PASSWORD = (tu contraseña)
SERP_API_KEY        = (tu API key)
PORT                = (cPanel asigna el puerto automáticamente — no cambiar)
```

> **Importante:** cPanel asigna el `PORT` internamente. La app lo lee con `process.env.PORT || 3001`, así que funciona en ambos entornos.

---

### Paso 5 — Instalar dependencias del servidor en cPanel

En **Setup Node.js App**, usa el botón **Run NPM Install** (instala sólo `server/`), o abre la terminal virtual de cPanel:

```bash
cd /home/TU_USUARIO/gaes-dashboard
npm install --prefix server --omit=dev
```

Si usas Git + `.cpanel.yml`, este paso se hace automáticamente en el deploy.

---

### Paso 6 — Iniciar la aplicación

Haz clic en **START APP** en la pantalla de Setup Node.js App.

Express sirve la API en `/api/*` y el build de React (`client/dist/`) como archivos estáticos. Todas las rutas no-API devuelven `index.html` para que React Router funcione en el cliente.

---

## Rutas API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/rankings/organic` | Rankings del dominio en Google |
| POST | `/api/keywords/ideas` | Keyword ideas desde seed keyword |
| POST | `/api/keywords/serp` | SERP top-10 para una keyword |

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATAFORSEO_LOGIN` | Email de cuenta DataForSEO |
| `DATAFORSEO_PASSWORD` | Contraseña de cuenta DataForSEO |
| `SERP_API_KEY` | API key adicional (reservada) |
| `PORT` | Puerto del servidor (default: 3001) |
