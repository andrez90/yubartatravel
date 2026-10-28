import type { Category, Plan, SiteContent } from './types';

/**
 * Contenido inicial extraído de https://yubartatravels.com/ (octubre 2026).
 * Lo que el sitio actual NO publica (precios, destinos de cada plan, correo)
 * queda vacío a propósito: se completa desde el panel /admin. No se inventó nada.
 */
const U = 'https://yubartatravels.com/wp-content/uploads';
const WA = '573216189634';

const mkPlans = (
  base: string,
  nums: (number | string)[],
  label: string,
  tagline: string,
): Plan[] =>
  nums.map((n, i) => ({
    active: true,
    title: `${label} #${i + 1}`,
    tagline,
    price: '',
    image: `${U}/2024/11/${n}-300x300.png`,
    description: '',
    includes: '',
    itinerary: '',
    whatsappText: `¡Hola! Estoy interesado en el plan "${label} #${i + 1}". ¿Me das información y precio?`,
  }));

const pasadias = mkPlans('', [2, 29, 26, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28], 'Pasadía', 'Diversión y adrenalina');
const pasanoches = mkPlans('', ['2-1', '3-1', '4-1', '5-1', '6-1', '7-1', '8-1'], 'Pasanoche', 'Diversión y adrenalina');
const excursiones = mkPlans('', ['10-1', '11-1', '12-1', '13-1', '14-1', '15-1', '16-1', '17-1', '18-1', '19-1', '20-1', '21-1', '22-1', '23-1'], 'Excursión', 'Diversión y adrenalina');

const womens: Plan = {
  active: false, // edición de marzo de 2025: se reactiva desde el panel cuando haya nueva fecha
  title: "Women's Travel Club · Santa Marta",
  tagline: 'Empodérate de tus sentidos',
  price: '',
  image: `${U}/2024/12/IMG005-768x1024.jpg`,
  description:
    'Viaje solo para mujeres con enfoque espiritual y de crecimiento personal, combinado con actividades recreativas frente al mar. Todas las mujeres pueden pertenecer. Edición anterior: 9 al 12 de marzo de 2025, Hostel Playa Paraíso Tropical, Santa Marta.',
  includes:
    'Traslado desde Santa Marta al hostel\nDesayunos, almuerzos y cenas\nYoga y terapia de sonido\nSesiones de crecimiento con psicóloga y coaching\nCaminata ecológica, fogatas y noche blanca de integración\nDanza en el mar',
  itinerary:
    'Día 1: llegada a Santa Marta, traslado al hostel, almuerzo, noche de integración y cena.\nDía 2: desayuno, yoga, trabajo emocional, almuerzo, danza de poder, gestión de emociones, escucha energética, terapia de empoderamiento, cierre de ceremonia y cena.\nDía 3: desayuno, caminata ecológica, almuerzo, tarde libre, noche blanca de integración, cierre de ceremonia y cena.\nDía 4: desayuno, danza en el mar y regreso al destino de origen.',
  whatsappText: "¡Hola! Quiero información del próximo Women's Travel Club.",
};

const categories: Category[] = [
  {
    slug: 'pasadias',
    name: 'Pasadías',
    tagline: 'Escapadas de un día a destinos cercanos',
    intro: 'Un día para desconectarte de la rutina, con diversión y adrenalina, sin tener que pasar la noche fuera.',
    image: `${U}/2024/08/Pasadia-1024x683.jpg`,
    seoTitle: 'Pasadías desde Palmira y Cali | Yubarta Travels',
    seoDescription: 'Planes de pasadía con diversión y adrenalina. Cotiza por WhatsApp con Yubarta Travels, agencia de viajes en Palmira, Valle.',
    plans: pasadias,
  },
  {
    slug: 'pasanoches',
    name: 'Pasanoches',
    tagline: 'Una noche fuera para vivir el día y la noche del destino',
    intro: 'Un pasanoche es la oportunidad perfecta para desconectarte de la rutina: más tiempo para explorar y disfrutar actividades de día y de noche.',
    image: `${U}/2024/08/galeriaO-2.jpg`,
    seoTitle: 'Pasanoches y planes de una noche | Yubarta Travels',
    seoDescription: 'Planes de pasanoche con diversión y adrenalina. Reserva por WhatsApp con Yubarta Travels, Palmira, Valle del Cauca.',
    plans: pasanoches,
  },
  {
    slug: 'excursiones',
    name: 'Excursiones',
    tagline: 'Aventura y experiencias para viajeros',
    intro: 'Excursiones con diversión y adrenalina para conocer lugares nuevos con acompañamiento y información clara.',
    image: `${U}/2024/08/galeriaO-3.jpg`,
    seoTitle: 'Excursiones y viajes de aventura | Yubarta Travels',
    seoDescription: 'Excursiones con diversión y adrenalina. Cotiza tu plan por WhatsApp con Yubarta Travels en Palmira, Valle.',
    plans: excursiones,
  },
  {
    slug: 'nacionales',
    name: 'Nacionales',
    tagline: 'Paquetes por Colombia',
    intro: 'Paquetes completos de transporte, alojamiento, alimentación y tours según tus intereses.',
    image: `${U}/2024/08/NacInt-1024x683.jpg`,
    seoTitle: 'Paquetes turísticos nacionales | Yubarta Travels',
    seoDescription: 'Paquetes nacionales con transporte, alojamiento, alimentación y tours. Cotiza con Yubarta Travels, agencia de viajes en Palmira.',
    plans: [womens],
  },
  {
    slug: 'internacionales',
    name: 'Internacionales',
    tagline: 'Paquetes para viajar por el mundo',
    intro: 'Planes internacionales con asesoría clara y acompañamiento. Cuéntanos tu destino y armamos tu viaje.',
    image: `${U}/2024/08/galeriaV-1.jpg`,
    seoTitle: 'Paquetes turísticos internacionales | Yubarta Travels',
    seoDescription: 'Planes internacionales con asesoría. Cotiza tu viaje con Yubarta Travels, agencia de viajes en Palmira, Valle del Cauca.',
    plans: [],
  },
];

export const DEFAULT_CONTENT: SiteContent = {
  settings: {
    name: 'Yubarta Travels',
    slogan: 'Viajeros y experiencias',
    tagline: 'Viajes y planes turísticos',
    logo: '/logo.png',
    whatsapp: WA,
    phoneDisplay: '+57 321 618 9634',
    email: '',
    address: 'Carrera 29 # 31 - 19, Palmira, Valle del Cauca, Colombia',
    city: 'Palmira, Valle del Cauca',
    mapQuery: 'Carrera 29 # 31-19, Palmira, Valle del Cauca, Colombia',
    facebook: 'https://www.facebook.com/yubartatravels',
    instagram: 'https://www.instagram.com/yubartatravels/',
    tiktok: '',
    rnt: '',
    primary: '#057272',
    accent: '#eea00c',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yubartatravels.com',
    seoTitle: 'Yubarta Travels | Agencia de viajes en Palmira, Valle del Cauca',
    seoDescription:
      'Agencia de viajes en Palmira: planes nacionales e internacionales, pasadías, pasanoches, excursiones, tiquetes, hoteles y seguros de viaje. Cotiza por WhatsApp.',
    whatsappMessage: '¡Hola! Estoy interesado en conocer los planes que tienen disponibles. ✈️',
    ogImage: `${U}/2024/08/galeriaO-1.jpg`,
    years: '3+',
    flights: '2.000+',
  },
  hero: {
    slides: [
      {
        active: true,
        region: 'Palmira · Valle del Cauca',
        title: 'Viajeros y experiencias',
        text: 'Planes turísticos, tiquetes, hoteles y seguros de viaje. Cuéntanos a dónde quieres ir y armamos tu viaje.',
        image: `${U}/2024/08/galeriaO-1.jpg`,
        link: '/#planes',
        linkLabel: 'Ver planes',
        cardRegion: 'Inicio',
        cardTitle: 'Bienvenido',
      },
      {
        active: true,
        region: 'Un día',
        title: 'Pasadías',
        text: 'Escapadas de un día a destinos cercanos, con diversión y adrenalina.',
        image: `${U}/2024/08/Pasadia-1024x683.jpg`,
        link: '/planes/pasadias',
        linkLabel: 'Ver pasadías',
        cardRegion: '',
        cardTitle: '',
      },
      {
        active: true,
        region: 'Una noche',
        title: 'Pasanoches',
        text: 'Una noche fuera para vivir el día y la noche del destino.',
        image: `${U}/2024/08/galeriaO-2.jpg`,
        link: '/planes/pasanoches',
        linkLabel: 'Ver pasanoches',
        cardRegion: '',
        cardTitle: '',
      },
      {
        active: true,
        region: 'Aventura',
        title: 'Excursiones',
        text: 'Excursiones con acompañamiento e información clara para que solo disfrutes.',
        image: `${U}/2024/08/galeriaO-3.jpg`,
        link: '/planes/excursiones',
        linkLabel: 'Ver excursiones',
        cardRegion: '',
        cardTitle: '',
      },
      {
        active: true,
        region: 'Colombia',
        title: 'Nacionales',
        text: 'Paquetes completos de transporte, alojamiento, alimentación y tours.',
        image: `${U}/2024/08/NacInt-1024x683.jpg`,
        link: '/planes/nacionales',
        linkLabel: 'Ver nacionales',
        cardRegion: '',
        cardTitle: '',
      },
      {
        active: true,
        region: 'El mundo',
        title: 'Internacionales',
        text: 'Viaja al exterior con asesoría de principio a fin.',
        image: `${U}/2024/08/galeriaV-1.jpg`,
        link: '/planes/internacionales',
        linkLabel: 'Ver internacionales',
        cardRegion: '',
        cardTitle: '',
      },
    ],
  },
  features: {
    items: [
      { icon: 'chat', title: 'Cotiza por WhatsApp', text: 'Escríbenos y te asesoramos con el plan que estás buscando.' },
      { icon: 'check', title: 'Información clara', text: 'Qué incluye, cómo reservar y cómo pagar, antes de decidir.' },
      { icon: 'shield', title: 'Cumplimiento', text: 'Cumplimos en todo lo contratado, sin sorpresas.' },
      { icon: 'heart', title: 'Te acompañamos', text: 'Antes, durante y después de tu viaje.' },
    ],
  },
  process: {
    title: 'Así de simple es viajar con nosotros',
    intro: 'Tres pasos, sin letra pequeña.',
    steps: [
      { title: 'Cuéntanos tu plan', text: 'Usa el cotizador o el formulario: destino, fecha y cuántas personas viajan.' },
      { title: 'Recibe tu propuesta', text: 'Te escribimos con el precio, qué incluye y cómo reservar.' },
      { title: 'Reserva y viaja', text: 'Confirmas con un abono y recibes toda la información de tu viaje.' },
    ],
  },
  quote: {
    title: 'Arma tu viaje y mira el valor estimado',
    intro: 'Elige el tipo de plan, cuántas personas viajan y lo que quieras sumar. Si algún valor aún no está definido, tu asesor lo confirma contigo.',
    note: 'Valor de referencia por persona. Lo confirmamos por escrito antes de que pagues.',
    kidsPercent: 100,
    extras: [
      { id: 'seguro', active: true, label: 'Seguro de viaje', help: 'Cobertura integral para viajar con tranquilidad.', price: 0, mode: 'persona' },
      { id: 'tiquetes', active: true, label: 'Tiquetes aéreos', help: 'Vuelos nacionales o internacionales.', price: 0, mode: 'persona' },
      { id: 'hotel', active: true, label: 'Hotel o alojamiento', help: 'Desde hostales hasta resorts.', price: 0, mode: 'persona' },
    ],
  },
  payments: {
    title: 'Reserva con tranquilidad',
    intro: 'Elige cómo prefieres pagar tu abono. Siempre te confirmamos por escrito antes de cobrar.',
    depositPercent: 30,
    terms: 'El abono separa tu cupo. Las condiciones de cambios y cancelaciones se te informan antes de pagar y están en la política de reembolsos.',
    methods: [
      { id: 'whatsapp', enabled: true, kind: 'whatsapp', label: 'Coordinar el pago por WhatsApp', help: 'Un asesor te indica cómo pagar.', link: '', details: '' },
      { id: 'wompi', enabled: false, kind: 'wompi', label: 'Tarjeta, PSE o Nequi', help: 'Pago en línea con Wompi (requiere configurar las claves).', link: '', details: '' },
      { id: 'link', enabled: false, kind: 'link', label: 'Enlace de pago', help: 'Pega aquí el enlace de tu pasarela (Mercado Pago, PayU, Bold…).', link: '', details: '' },
      { id: 'transfer', enabled: false, kind: 'transfer', label: 'Transferencia bancaria', help: 'Te mostramos los datos de la cuenta.', link: '', details: '' },
    ],
  },
  cta: {
    title: 'Cuéntanos a dónde quieres ir',
    text: 'Te armamos el viaje y te cotizamos por WhatsApp.',
    image: `${U}/2024/08/galeriaV-2.jpg`,
    label: 'Escribir por WhatsApp',
  },
  services: {
    title: 'Todo para tu viaje, en un solo lugar',
    intro: 'Servicios de calidad y seguridad para que solo te preocupes por disfrutar.',
    items: [
      { title: 'Viajes nacionales e internacionales', text: 'Paquetes completos de transporte, alojamiento, alimentación y tours, según tus intereses.', image: `${U}/2024/08/NacInt-1024x683.jpg`, link: '/planes/nacionales' },
      { title: 'Viajes y planes turísticos', text: 'Planes pensados para conocer, descansar y vivir experiencias con acompañamiento.', image: `${U}/2024/08/Planes-1024x683.jpg`, link: '/#planes' },
      { title: 'Tiquetes', text: 'Reserva de vuelos nacionales e internacionales con las mejores tarifas.', image: `${U}/2024/08/tickets-1-1024x683.jpg`, link: '/#contacto' },
      { title: 'Hoteles', text: 'Alojamientos cómodos y de calidad, desde hostales hasta resorts.', image: `${U}/2024/08/hotels-1024x683.jpg`, link: '/#contacto' },
      { title: 'Pasadías y pasanoches', text: 'Escapadas de un día o una noche a destinos cercanos.', image: `${U}/2024/08/Pasadia-1024x683.jpg`, link: '/planes/pasadias' },
      { title: 'Seguros de viaje', text: 'Cobertura integral para viajar con tranquilidad.', image: `${U}/2024/08/insurance-1024x683.jpg`, link: '/#contacto' },
    ],
  },
  categories: {
    title: 'Elige tu próximo plan',
    intro: 'Pasadías, pasanoches, excursiones y paquetes. Escríbenos por WhatsApp y cotizamos al instante.',
    items: categories,
  },
  gallery: {
    title: 'Viajeros felices',
    items: [
      'galeriaO-1', 'galeriaO-2', 'galeriaO-3', 'galeriaO-4', 'galeriaV-1', 'galeriaV-2', 'galeriaV-3', 'galeriaV-4',
    ].map((n) => ({ image: `${U}/2024/08/${n}.jpg`, alt: 'Viajeros de Yubarta Travels disfrutando de su plan' })),
  },
  about: {
    title: 'Quiénes somos',
    text: 'Somos una agencia de viajes y turismo enfocada en ofrecer servicios de calidad y seguridad. Acompañamos a cada viajero antes, durante y después de su plan, con información clara y cumplimiento en todo lo contratado.',
    image: `${U}/2026/07/PHOTO-2026-06-06-11-39-09-1024x751.jpg`,
    stats: [
      { value: '3+', label: 'años de trayectoria' },
      { value: '2.000+', label: 'vuelos vendidos' },
    ],
  },
  testimonials: {
    title: 'Lo que dicen nuestros viajeros',
    intro: 'La mejor manera de decidir es escuchar a quienes ya han sido parte.',
    items: [
      { name: 'Erika Madroñero', trip: 'Pasadía · La casa en el aire', text: 'La casa en el aire mirador nos ofreció unos paisajes increíbles. Un día mágico; volvería a reservar con ellos.', stars: 5 },
      { name: 'Nicol Rico', trip: 'Cuba', text: 'Mi primer viaje internacional fue a Cuba con Yubarta: muy puntuales, cumplidos y claros con la información de mi plan de viaje. Los recomiendo para cualquier destino.', stars: 5 },
      { name: 'Luz Mary Camacho', trip: 'Londres', text: 'Saludos desde Londres. Con ellos siempre viajo y todo es muy seguro.', stars: 5 },
      { name: 'Judith Garcia', trip: 'La Guajira', text: 'Un viaje mochilero a La Guajira: una de las mejores experiencias de mi vida. Súper recomendados.', stars: 5 },
      { name: 'Cristian Casanova', trip: 'Europa', text: 'Cumplí mi sueño de vivir en Europa. Una empresa muy seria y segura para viajar a Europa, con excelente asesoría.', stars: 5 },
      { name: 'Nilsa Salgado', trip: 'Varios viajes', text: 'Todos mis viajes con Yubarta han sido exitosos; la edad no me pone los límites.', stars: 5 },
      { name: 'Jhonatan Ovalle', trip: 'Amazonas', text: 'Viajé al Amazonas con Yubarta y destaco su cumplimiento en todo lo contratado.', stars: 5 },
    ],
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      { q: '¿Cómo reservo un plan?', a: 'Escríbenos por WhatsApp al +57 321 618 9634 con el plan que te interesa. Te asesoramos, cotizamos y te explicamos los pasos para reservar.' },
      { q: '¿Qué servicios ofrece Yubarta Travels?', a: 'Paquetes nacionales e internacionales, pasadías, pasanoches, excursiones, tiquetes aéreos, hoteles y seguros de viaje.' },
      { q: '¿Dónde están ubicados?', a: 'Estamos en la Carrera 29 # 31 - 19, Palmira, Valle del Cauca, Colombia. También atendemos por WhatsApp.' },
      { q: '¿Pueden ayudarme con tiquetes y hoteles por separado?', a: 'Sí. Gestionamos tiquetes nacionales e internacionales y alojamientos, desde hostales hasta resorts, aunque no compres un paquete completo.' },
      { q: '¿Venden seguros de viaje?', a: 'Sí, ofrecemos seguros de viaje con cobertura integral. Pregúntanos por las opciones disponibles para tu destino.' },
    ],
  },
  legal: {
    items: [
      {
        slug: 'politica-de-privacidad',
        title: 'Política de privacidad y tratamiento de datos personales',
        version: '0.1-borrador',
        updated: '2026-10-28',
        body: `BORRADOR: debe ser revisado por un abogado antes de publicarse. Complete los datos entre corchetes.

## Responsable del tratamiento
[RAZON_SOCIAL], NIT [NIT], domicilio en Carrera 29 # 31 - 19, Palmira, Valle del Cauca. Correo: [CORREO_PRIVACIDAD]. Teléfono: +57 321 618 9634.

## Datos que recogemos
Nombre, correo electrónico, asunto y mensaje que usted escribe en el formulario de contacto, y los datos que nos comparta por WhatsApp.

## Finalidades
- Atender su solicitud y responderle.
- Enviar cotizaciones de viajes.
- Enviar información comercial, solo si usted lo autoriza de forma separada y opcional.

## Sus derechos
Conocer, actualizar, rectificar y suprimir sus datos, revocar la autorización y presentar quejas ante la Superintendencia de Industria y Comercio (SIC). Para ejercerlos escriba a [CORREO_PRIVACIDAD]. Atendemos consultas en 10 días hábiles (prorrogables 5) y reclamos en 15 días hábiles (prorrogables 8).

## Menores y datos sensibles
No solicitamos datos sensibles. Los datos de menores de edad solo se tratan con autorización de sus representantes legales.

## Transferencias
Usamos proveedores de alojamiento y analítica que pueden estar fuera de Colombia (por ejemplo Supabase, Vercel, Google). Solo se envían los datos necesarios.

## Conservación y vigencia
Conservamos los datos mientras exista la relación comercial o la ley lo exija. Esta política rige desde la fecha indicada arriba.`,
      },
      {
        slug: 'terminos-y-condiciones',
        title: 'Términos y condiciones',
        version: '0.1-borrador',
        updated: '2026-10-28',
        body: `BORRADOR: debe ser revisado por un abogado antes de publicarse.

## Quiénes somos
[RAZON_SOCIAL], NIT [NIT], agencia de viajes con domicilio en Carrera 29 # 31 - 19, Palmira, Valle del Cauca. Registro Nacional de Turismo: [RNT]. Contacto: +57 321 618 9634 · [CORREO].

## Servicios
Intermediamos y organizamos planes turísticos, tiquetes, hoteles y seguros de viaje. La descripción, el precio total (con impuestos) y las condiciones de cada plan se confirman por escrito antes del pago.

## Reservas y pagos
La reserva queda confirmada cuando recibimos el pago acordado y le enviamos la confirmación. Los medios de pago y los plazos se informan en cada cotización.

## Cambios y cancelaciones
Dependen de las condiciones de cada proveedor (aerolínea, hotel, operador). Se informan antes de pagar. Consulte la política de reembolsos.

## Propiedad intelectual
Los textos, imágenes y marca de este sitio pertenecen a Yubarta Travels o se usan con autorización.

## Ley aplicable y reclamos
Rige la ley colombiana. Puede presentar peticiones, quejas y reclamos a [CORREO] y acudir a la Superintendencia de Industria y Comercio (SIC).`,
      },
      {
        slug: 'politica-de-cookies',
        title: 'Política de cookies',
        version: '0.1-borrador',
        updated: '2026-10-28',
        body: `BORRADOR: debe ser revisado por un abogado antes de publicarse.

## Qué son
Pequeños archivos que se guardan en su navegador para recordar preferencias y medir el uso del sitio.

## Cookies que usamos
- Necesarias: guardan su elección de cookies. No requieren consentimiento.
- Analítica (Google Analytics 4): miden visitas y clics en WhatsApp. Solo se activan si usted las acepta.

## Cómo cambiar su decisión
Use el botón «Preferencias de cookies» del pie de página para aceptar, rechazar o configurar en cualquier momento.`,
      },
      {
        slug: 'politica-de-reembolsos',
        title: 'Política de reembolsos y retracto',
        version: '0.1-borrador',
        updated: '2026-10-28',
        body: `BORRADOR: debe ser revisado por un abogado antes de publicarse.

## Derecho de retracto
En ventas a distancia puede ejercer el retracto dentro de los 5 días hábiles siguientes a la entrega del servicio o contratación, salvo las excepciones legales (por ejemplo, servicios de turismo con fecha o período específico y tiquetes aéreos sujetos a las condiciones de la aerolínea). [Verificar con abogado según Ley 1480 de 2011 y Ley 2439 de 2024.]

## Devolución del dinero
Si procede, la devolución se hace dentro de los 15 días calendario siguientes al ejercicio del derecho, por el mismo medio de pago.

## Cómo solicitarlo
Escriba por WhatsApp al +57 321 618 9634 o a [CORREO] indicando su nombre, plan y fecha de compra.

## Reversión del pago
Si hubo fraude, operación no solicitada o no entrega del servicio, puede solicitar la reversión del pago a su entidad financiera según la ley.`,
      },
    ],
  },
};
