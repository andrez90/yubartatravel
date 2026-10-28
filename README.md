# Yubarta Travels · sitio web + panel administrativo

Sitio Next.js 15 (rápido, con SEO) con el hero de tarjetas en movimiento y un **panel `/admin`** para editar textos, planes, precios, fotos, logo y gestionar solicitudes, cotizaciones, reservas y medios de pago, sin tocar código. El contenido inicial viene de https://yubartatravels.com/.

## 1. Probarlo en tu computador
```bash
npm install
cp .env.example .env.local      # luego llena las claves (paso 2)
npm run dev                     # http://localhost:3000
```
Sin Supabase el sitio funciona igual con el contenido inicial; el panel solo mostrará las instrucciones de conexión.

## 2. Conectar el panel (Supabase, gratis)
1. Crea un proyecto en supabase.com.
2. Abre `supabase/schema.sql`, **cambia `CAMBIA-ESTO@tucorreo.com` por el correo del administrador** y ejecútalo en *SQL Editor*.
3. *Authentication → Users → Add user*: crea ese correo con una contraseña. En *Authentication → Sign In / Providers* **desactiva «Allow new users to sign up»**.
4. *Project Settings → API*: copia `Project URL`, `anon public` y `service_role` a `.env.local`. La `service_role` es secreta: solo va en el servidor (nunca con `NEXT_PUBLIC_`).
5. Entra a `/admin`, inicia sesión y edita. «Guardar y publicar» actualiza el sitio al instante.

## 3. Publicar (Vercel)
1. Sube el proyecto a GitHub (commit y push los haces tú).
2. En Vercel: *Add New → Project*, importa el repo y agrega las variables de `.env.example`.
3. Configura el dominio (`NEXT_PUBLIC_SITE_URL`). Redirige `www` ↔ sin `www` a una sola versión.
4. **Seguridad (skill proteger-sitio-ddos):** pon Cloudflare gratis delante del dominio (proxy activo, SSL «Completo estricto», Bot Fight Mode), reglas de límite en `/api/*`, alertas y tope de gasto en Vercel y Supabase, y monitoreo con UptimeRobot. Interruptor de emergencia del formulario: `CONTACT_PAUSED=1`.
5. **Después de publicar (skill lanzar-visibilidad-sitio):** verifica el dominio en Search Console, envía `https://TU-DOMINIO/sitemap.xml`, solicita indexación (portada, categorías, legales) y crea la ficha de Google Business con los mismos nombre, dirección y teléfono.

## 4. Qué se puede editar desde /admin
Solicitudes y reservas (con estados, notas, WhatsApp y Excel) · Datos del negocio y SEO · Portada (carrusel) · Planes y precios por categoría (precio, duración, fechas, etiqueta) · Ventajas · Cómo funciona · Cotizador (extras) · Pagos (medios y abono) · Tarjeta «Escríbenos» · Servicios · Quiénes somos · Galería · Testimonios · Preguntas frecuentes · Documentos legales · Respaldo en JSON. Las fotos se comprimen a WebP (máx. 1600 px) antes de subirse.

## 4b. Cotizador, reservas y pagos (cómo funciona)
- **Cotizador** (`/#cotizador`): el cliente elige tipo de plan, cuántas personas y extras. El precio base sale de «Precio por persona» de cada plan (o «Precio base» de la categoría). Lo que valga 0 se muestra «por confirmar». «Pedir esta cotización» llena el formulario con el resumen.
- **Formulario en 2 pasos** (`/api/contact`): guarda en la tabla `leads` (tipo contacto o cotización), con el origen (UTM), el texto exacto de cada autorización en `consent_logs`, trampa anti‑bots, tiempo mínimo y límite de envíos. El valor de la cotización se **recalcula en el servidor**; nunca se confía en lo que manda el navegador.
- **Reservar** (`/reservar/[categoría]/[plan]` + `/api/booking`): crea la reserva con un código (`YT-XXXXXX`) y el abono sugerido (% configurable en «Pagos»).
- **Pagar** (`/api/checkout`): según los medios que actives en «Pagos»: coordinar por WhatsApp, enlace de pago (pegas el de tu pasarela), transferencia (muestra los datos de la cuenta) o **Wompi** (redirección con firma de integridad; requiere `WOMPI_PUBLIC_KEY` y `WOMPI_INTEGRITY_SECRET`, primero con las claves de prueba y confirmando el formato de la firma en la documentación vigente de Wompi).
- **Lo que falta para cobrar 100 % automático:** un *webhook* de la pasarela que marque la reserva como pagada. Hoy el equipo cambia «Pago pendiente → Pagado» a mano en «Solicitudes y reservas». Se agrega cuando elijas pasarela.
- Si ya tenías el esquema, **vuelve a ejecutar `supabase/schema.sql`** (es seguro repetirlo): crea la tabla `leads`.

## 5. Pendientes del dueño (no se inventaron)
- **Precios y datos de cada plan**: el sitio actual no los publica (las tarjetas son afiches con el botón «Cotizar»). Cada plan se llama «Pasadía #1…» hasta que le pongas nombre real en el panel.
- **Páginas Nacionales e Internacionales** del sitio actual no se pudieron leer: quedan vacías (Nacionales solo tiene el *Women's Travel Club*, oculto porque su fecha fue marzo de 2025).
- Correo de contacto, RNT (Registro Nacional de Turismo), razón social y NIT para los documentos legales.
- Fotos propias: hoy las imágenes se leen directo de yubartatravels.com. Sube las tuyas desde el panel antes de apagar el sitio viejo.
- **Precios, abono y medios de pago reales** (el cotizador y los pagos quedan listos pero sin valores): ponlos en «Planes y precios», «Cotizador» y «Pagos».
- Elegir pasarela (Wompi, Mercado Pago, PayU, Bold…) y abrir la cuenta; se necesita RNT, razón social y NIT.
- Revisión de los documentos legales por un abogado (son borradores).
- Medición: crea la propiedad de GA4 y pon su ID en `NEXT_PUBLIC_GA_ID` (solo carga tras aceptar cookies).

## 6. Estructura
`src/app` páginas y API · `src/components` hero, secciones, formulario · `src/app/admin` panel · `src/lib/defaultContent.ts` contenido inicial · `supabase/schema.sql` base de datos y permisos · `docs/` palabras clave, matriz legal.
