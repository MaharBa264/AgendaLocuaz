# Plan de implementación — local-first

## Hito 0: infraestructura y autenticación
- Retirar integración Supabase del prototipo.
- Crear Google Cloud Project, configurar OAuth y pantalla de consentimiento.
- Habilitar Calendar API y Drive API; revisar scopes y posible verificación.
- Conectar Cloudflare Pages y probar compilación CI.
- PWA shell, diseño responsive, tokens de sesión y cierre de sesión.

## Hito 1: Google Calendar
- Listar calendarios y eventos, vistas semana/mes.
- CRUD de eventos, recurrencias y recordatorios.
- Calendarios compartidos mediante ACL nativas de Google.
- Caché local y sincronización básica.

## Hito 2: listas
- Definir formato JSON versionado en Drive; ETags, conflictos y reintentos.
- CRUD tareas/compras, dependientes y preferencias.
- Prototipar colaboración de listas con Drive (no asumir que appDataFolder se comparte).

## Hito 3: interpretación
- Parser determinista y captura de voz con fallback.
- Pantalla de revisión antes de persistir.
- IA opcional con consentimiento y privacidad.

## Hito 4: offline y calidad
- Cola de cambios, reconciliación y pruebas de conflictos.
- Exportación, desconexión y limpieza local.
- Pruebas Android/PWA, documentación de limitaciones de avisos.

## Prioridad inmediata
Configurar OAuth Google y Calendar API. No continuar configurando Supabase.
