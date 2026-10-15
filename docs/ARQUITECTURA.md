# Agenda Locuaz — Contrato de arquitectura local-first v2 (2026-10-14)

## Decisión aprobada
Cada usuario controla sus datos en su cuenta de Google. No existe una base de datos central de agendas administrada por el desarrollador. Supabase queda descartado del núcleo. Esta decisión sustituye el contrato v1.

## Plataforma
React + TypeScript + Vite, PWA alojada en Cloudflare Pages. IndexedDB como almacenamiento local y cola de sincronización. La instalación PWA, uso offline y soporte de voz varían por navegador.

## Identidad y acceso
Google Identity Services y OAuth 2.0 Authorization Code + PKCE cuando corresponda. Solicitar scopes incrementales y mínimos; tokens protegidos y no guardados en repositorios. Configurar pantalla de consentimiento, dominios y orígenes autorizados. Algunas scopes de Drive pueden exigir verificación adicional de Google; evaluar appDataFolder y sus limitaciones antes de cerrar scopes.

## Datos
- Google Calendar API: eventos, recurrencias, calendarios personales y compartidos, alertas de eventos. La colaboración se realiza mediante permisos nativos de Google Calendar.
- IndexedDB: copia local, operaciones pendientes y datos de UI.
- Google Drive API: documentos estructurados versionados de tareas, compras, perfiles dependientes y preferencias. Preferir appDataFolder para datos privados; no sirve como espacio compartido. Para listas compartidas, evaluar archivos normales de Drive con permisos y conflictos o alternativa Google Tasks/Calendar; decisión abierta y requiere prototipo.
- Formato exportable JSON versionado, sin dependencia del esquema de un backend propio.

## Sincronización
Adaptadores separados CalendarRepository, DriveRepository y LocalRepository. Usar sync tokens/ETags cuando estén disponibles, IDs estables, reintentos, backoff y detección de conflictos. Evitar sobrescritura silenciosa. Modo offline con estado visible.

## Recordatorios
Eventos: recordatorios configurados en Google Calendar, cuya entrega depende de Google y de las preferencias del usuario. Tareas: recordatorios locales mientras la plataforma lo permita; NO prometer alarmas garantizadas con PWA cerrada sin servicio push/backend. Investigar alternativas como evento auxiliar en Calendar con consentimiento.

## Lenguaje natural
Parser determinista español argentino, validación de fechas/zonas horarias y confirmación previa. IA externa opcional solo con consentimiento, límites de uso y tratamiento explícito de privacidad. Voz del dispositivo cuando esté disponible, con alternativa escrita.

## Privacidad
Sin base central del operador; sin embargo, Google procesa y aloja datos y el operador de la web puede desplegar código que accede a datos autorizados: no prometer cifrado extremo a extremo ni independencia absoluta de terceros. Exportar y desconectar cuenta. Scopes mínimos, revocación y borrado local.

## No configurado
Google Cloud OAuth, Calendar API, Drive API, Cloudflare Pages, pruebas de permisos y sincronización. El código Supabase en la rama de prototipo se considera obsoleto y debe retirarse antes del merge.
