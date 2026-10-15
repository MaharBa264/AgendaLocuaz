# MVP local-first — Agenda Locuaz

1. Inicio de sesión Google con permisos incrementales.
2. Vista de agenda día/semana/mes usando Calendar API.
3. Crear/editar/cancelar eventos y recurrencias, con confirmación de interpretación.
4. Usar calendarios compartidos con permisos nativos de Google.
5. Tareas y compras locales, sincronizadas con Drive propio mediante archivos versionados.
6. Perfiles dependientes como metadatos de usuario, sin cuentas propias.
7. Entrada por texto y voz cuando el dispositivo lo permita.
8. Recordatorios de eventos mediante Calendar; avisos de tareas sujetos a limitaciones PWA.
9. Offline de lectura y cambios pendientes con detección de conflictos.
10. Exportación JSON y desconexión.

## Criterios de aceptación
- Un usuario ve solo calendarios y archivos para los que autorizó acceso.
- Un evento creado aparece en Google Calendar y en otro dispositivo.
- Un evento compartido respeta los permisos nativos del calendario.
- Una lista privada se sincroniza sin perder cambios concurrentes.
- Sin conexión se muestran datos cacheados y cambios pendientes, claramente identificados.
- No se guarda ninguna interpretación ambigua sin confirmación.
- Se documentan límites de recordatorios con la PWA cerrada.

## Fuera de alcance
Base Supabase central, chat autónomo, WhatsApp, Android Kotlin separado, garantía de alarmas exactas con PWA cerrada.
