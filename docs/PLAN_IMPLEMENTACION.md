# Plan de implementación

## Hito 0 — Base técnica
- Inicializar Vite React TypeScript, lint, tests, estructura de carpetas y CI.
- Crear proyectos Cloudflare y Supabase (DEV), variables de entorno y guía de configuración.
- Definir migraciones SQL, políticas RLS y pruebas automatizadas de aislamiento.
- Configurar OAuth Google con redirects de desarrollo y producción.
Salida: login funcional y despliegue de prueba.

## Hito 1 — Núcleo de agenda
- Perfil, espacios personales, calendario y CRUD de eventos.
- Tareas y listas; dependientes; recurrencias y zona horaria.
Salida: dos dispositivos consultan los mismos datos.

## Hito 2 — Entrada natural
- Parser determinista en español argentino, fechas relativas, recurrencias y recordatorios.
- Captura de voz disponible en dispositivo; pantalla de revisión.
- Adaptador opcional para IA, con secretos server-side, límites y pruebas.
Salida: creación de eventos/tareas a partir de frases.

## Hito 3 — Avisos
- Preferencias, reglas adaptativas, scheduler, web push y reprogramación.
- Pruebas de permisos, duplicados, cancelaciones y app cerrada.
Salida: avisos confiables dentro de las limitaciones documentadas.

## Hito 4 — Compartir y offline
- Invitaciones, roles, dependientes y políticas RLS.
- IndexedDB, cola offline, sincronización y conflictos.
- Pruebas E2E y experiencia Android PWA.
Salida: MVP candidato a uso cotidiano.

## Flujo Git
main estable; ramas feat/*, fix/*, docs/*; PR con pruebas y checklist. CI antes de merge. No subir secretos ni datos reales de menores.

## Primeras tareas
1. Scaffold y CI.
2. Esquema SQL y RLS.
3. Autenticación Google.
4. Diseño UI móvil.
5. CRUD de eventos y tareas.
6. Parser de lenguaje natural.
7. Push/scheduler.
8. Colaboración/offline.
