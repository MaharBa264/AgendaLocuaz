# Agenda Locuaz

Agenda personal inteligente y colaborativa, con carga por voz o texto, tareas, calendario y recordatorios adaptativos.

## Estado
Proyecto en fase de diseño aprobado. Implementación pendiente.

## Arquitectura
- PWA: React, TypeScript, Vite, Tailwind CSS.
- Alojamiento: Cloudflare Pages; Functions para endpoints con secretos.
- Backend: Supabase (PostgreSQL, Auth con Google, Row Level Security).
- Offline: IndexedDB (Dexie) y sincronización con cola de operaciones.
- Lenguaje natural: parser determinista primero; proveedor IA opcional detrás de endpoint seguro.
- Voz: reconocimiento disponible en navegador/dispositivo con entrada de texto como alternativa.
- Recordatorios: reglas adaptativas explicables; entrega mediante push y servicio programador (a definir y validar).

Ver [arquitectura](docs/ARQUITECTURA.md), [MVP](docs/MVP.md) y [plan](docs/PLAN_IMPLEMENTACION.md).

## Seguridad
No colocar claves secretas de Supabase ni de proveedores IA en el frontend. La clave pública de Supabase se utiliza solo con políticas RLS verificadas. Los datos de menores y grupos son privados.

## Inicio
Antes de desplegar: crear proyectos Supabase y Cloudflare, configurar OAuth de Google, secretos y variables de entorno, migraciones y políticas RLS. Ninguno de estos recursos se considera configurado todavía.
