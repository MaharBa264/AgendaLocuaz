# Agenda Locuaz

Agenda personal inteligente y colaborativa, local-first, con datos propiedad del usuario.

## Arquitectura aprobada
- React + TypeScript + Vite; PWA en Cloudflare Pages.
- Google OAuth para identidad.
- Google Calendar API para eventos y calendarios compartidos.
- Google Drive API para tareas, compras y preferencias.
- IndexedDB para caché local y cambios pendientes.
- Voz del dispositivo y parser híbrido (reglas + IA opcional).

**No usamos una base Supabase central.** La rama de desarrollo incluye un prototipo de OAuth con Google Identity Services y lectura/creación de eventos en el calendario principal. No incluye aún Drive, sincronización offline ni listas.

Ver [arquitectura](docs/ARQUITECTURA.md), [MVP](docs/MVP.md) y [plan](docs/PLAN_IMPLEMENTACION.md).

## Estado
Documentación v2 aprobada; implementación de Calendar OAuth en rama de desarrollo, pendiente de configurar y probar con credenciales reales. Los permisos de Drive y Calendar deben configurarse cuidadosamente; el almacenamiento es del usuario, pero Google sigue siendo un proveedor externo.

## Configuración del primer prototipo
1. Google Cloud OAuth: agregar como origen autorizado de JavaScript la URL exacta de Cloudflare Pages, por ejemplo `https://agendalocuaz.pages.dev` (sin barra final).
2. Cloudflare Pages > Settings > Environment variables: definir `VITE_GOOGLE_CLIENT_ID` con el Client ID público de Google (no el secreto). Configurarlo para el entorno que despliega la rama de pruebas.
3. Ejecutar nuevo despliegue: las variables `VITE_*` se incorporan en tiempo de compilación.
4. En Google Auth Platform, conservar la app en modo de prueba y agregar las cuentas de prueba.
5. La app solicita `openid email profile calendar.events` y mantiene el access token solo en memoria. Al recargar se requiere autorizar de nuevo; no hay refresh token.
6. Los eventos se crean en el calendario principal, duran una hora y llevan avisos popup de 24 h, 6 h y 1 h. La entrega de avisos depende de Google y de la configuración del usuario.

**Seguridad:** nunca subir un Client Secret ni claves privadas al repositorio o a variables `VITE_*`. El Client ID no es secreto.
