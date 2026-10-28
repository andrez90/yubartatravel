# Reglas del proyecto
- No inventar datos del negocio (precios, RNT, NIT, testimonios). Dejar marcadores y avisar.
- El contenido editable vive en `src/lib/defaultContent.ts` (valores iniciales) y en Supabase (`content`); no escribir textos sueltos en componentes.
- El dueño hace el commit, el push y el despliegue.
- Solo animar `transform` y `opacity`; respetar `prefers-reduced-motion`.
- Antes de entregar: `npm run typecheck && npm run build`.
