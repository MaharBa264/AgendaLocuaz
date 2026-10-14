# Contrato de arquitectura v1 — 2026-10-14

## Decisiones aprobadas
PWA, Supabase, interpretación híbrida, voz nativa/disponible en dispositivo, recordatorios adaptativos, espacios colaborativos, offline básico, Cloudflare.

## Componentes
- React + TypeScript + Vite + Tailwind; TanStack Query para consultas, Zustand para estado UI.
- Dexie/IndexedDB para caché y cola de cambios pendientes; service worker para assets.
- Supabase Auth con Google OAuth, PostgreSQL con RLS en todas las tablas privadas.
- Cloudflare Pages para el frontend y Functions para interpretación asistida por IA y otras operaciones privilegiadas.
- Parser de fechas, recurrencias y entidades determinista con pruebas; salida tipada validada con Zod.
- Voz por APIs del navegador/dispositivo donde estén disponibles, con fallback manual. No se garantiza reconocimiento offline.

## Modelo inicial
profiles, spaces, memberships, dependents, calendars, events, event_recurrences, tasks, lists, list_items, reminder_preferences, reminders, device_subscriptions, sync_operations.
Cada entidad privada pertenece a usuario o espacio. Dependents son perfiles sin login; no son cuentas autenticadas.

## Autorización
Roles de espacio: owner, editor, viewer. RLS comprueba membresía activa y acceso al recurso. No confiar en IDs aportados por el cliente sin autorización. Las claves de servicio nunca salen del servidor.

## Fechas y horarios
Guardar instantes en UTC y zona horaria IANA del evento (por defecto America/Argentina/San_Luis configurable). Reglas de recurrencia en horario local; resolver excepciones, cancelaciones y horario de verano.

## Offline
Lectura y creación/edición básica offline. Cola con IDs estables, idempotencia y estado de sincronización visible. Resolver conflictos con estrategia explícita por entidad; evitar pérdida silenciosa. Permisos revocados bloquean la sincronización.

## Interpretación
Primero reglas locales. Si hay ambigüedad, mostrar confirmación o solicitar aclaración. IA opcional bajo consentimiento y límites de uso; nunca ejecutar operaciones inferidas sin confirmación. No enviar información personal innecesaria al proveedor.

## Recordatorios
Preferencias por usuario/categoría y evento; anticipaciones sugeridas 24 h, 6 h, 1 h, editables. Aprendizaje inicial por preferencias explícitas y ajustes observados, sin modelo entrenado. Programador del lado servidor y push web; evaluar límites de PWA Android, permisos, disponibilidad y entrega no garantizada. Idempotencia, cancelación y reprogramación al editar eventos.

## Decisiones técnicas abiertas
Proveedor de IA y cuota; estrategia de jobs programados; esquema de conflictos offline; política de retención; entorno de staging y producción; credenciales OAuth y push. No bloquear el hito 1 por estas decisiones.
