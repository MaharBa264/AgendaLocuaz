# MVP y criterios de aceptación

## Producto
Agenda personal primero; grupos opcionales para familia o trabajo.

## Funciones
1. Inicio de sesión Google y perfil.
2. Vistas de calendario día/semana/mes; eventos y recurrencias.
3. Tareas, listas de compras y marcado de completado.
4. Espacios privados/compartidos, invitaciones y roles.
5. Dependientes (hijos sin cuenta propia), asociados a espacios.
6. Entrada por texto y voz cuando el dispositivo lo permita; parser híbrido con revisión previa.
7. Recordatorios configurables/adaptativos y notificaciones push autorizadas.
8. Caché offline y cola de cambios con sincronización posterior.

## Aceptación funcional
- Un usuario crea evento y tarea y los ve desde dos dispositivos.
- Un usuario sin membresía no puede leer ni modificar datos ajenos (pruebas RLS).
- Una invitación aceptada concede solo el rol previsto.
- Una frase como 'el martes que viene a las 17 llevar a Martina a hockey, avisame un día antes' produce una propuesta verificable, no un guardado automático.
- Una frase ambigua solicita confirmación y no inventa datos.
- Un evento recurrente admite edición de una instancia sin alterar toda la serie.
- Un cambio offline se sincroniza al reconectar sin duplicados; un conflicto se muestra.
- Al editar/cancelar evento, sus recordatorios pendientes se actualizan/cancelan.
- Los recordatorios no se prometen a una hora exacta: dependen de permisos y entrega push.

## Fuera de alcance inicial
Sincronización bidireccional Google Calendar, WhatsApp, asistentes autónomos, aprendizaje opaco y Android Kotlin separado.
