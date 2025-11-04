# CBT Frontend – Instituto CBT

Frontend en React + Vite con componentes shadcn (Radix + Tailwind v4) para administración, inscripciones, pagos y asistencias.

## Rutas principales
- `/` Landing con accesos rápidos (Inscripción, Registro de Pagos)
- `/login` Inicio de sesión (Admin/Docente)
- `/inscripcion` Formulario de inscripción (RHF + Zod, autosave)
- `/pagos/registro` Registro de pagos con validación y upload
- `/asistencias` Vista inicial (Docente)
- `/admin` Dashboard (en progreso)

## Tecnologías
- React 19, TypeScript, Vite 7
- shadcn UI (Radix) + Tailwind v4
- React Hook Form + Zod
- React Query (instalado) para fetch/caching
- Framer Motion para micro-interacciones

## Ejecución
```powershell
npm install
npm run dev
```

Nota: Vite ≥7 requiere Node.js 20.19+. Se detectó 20.15 con advertencias; actualizar Node si es posible.

## Diseño y Accesibilidad
- Tokens via CSS variables en `src/index.css` (radius global 8px)
- Componentes accesibles (aria, focus-visible)

## Integración con Backend
Contratos y recomendaciones en `docs/backend-integration.md`.

## Próximos pasos
- Panel de Admin (bandejas, CRUDs, reportes)
- Estado global (Zustand) y client API
- Testing (Jest + RTL, Cypress)
