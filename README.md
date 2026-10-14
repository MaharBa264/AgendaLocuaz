# Agenda Locuaz

Agenda personal inteligente y colaborativa, local-first, con datos propiedad del usuario.

## Arquitectura aprobada
- React + TypeScript + Vite; PWA en Cloudflare Pages.
- Google OAuth para identidad.
- Google Calendar API para eventos y calendarios compartidos.
- Google Drive API para tareas, compras y preferencias.
- IndexedDB para caché local y cambios pendientes.
- Voz del dispositivo y parser híbrido (reglas + IA opcional).

**No usamos una base Supabase central.** El prototipo inicial en feat/hito0-pwa-base todavía incluye código Supabase que debe retirarse antes del merge. No se considera funcional ni desplegado.

Ver [arquitectura](docs/ARQUITECTURA.md), [MVP](docs/MVP.md) y [plan](docs/PLAN_IMPLEMENTACION.md).

## Estado
Documentación v2 aprobada; implementación y OAuth Google pendientes. Los permisos de Drive y Calendar deben configurarse cuidadosamente; el almacenamiento es del usuario, pero Google sigue siendo un proveedor externo.
