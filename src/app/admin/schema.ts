import type { SectionKey } from '@/lib/types';

export type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'number' | 'bool' | 'color' | 'list' | 'heading' | 'select';
  options?: [string, string][]; // para 'select': [valor, texto]
  max?: number; // para 'number'
  help?: string;
  placeholder?: string;
  rows?: number;
  fields?: Field[]; // para listas
  itemTitle?: string; // campo que sirve de título de cada elemento
  addLabel?: string;
  def?: unknown; // valor por defecto al crear un elemento nuevo
};

export type SectionDef = { key: SectionKey; title: string; icon: string; desc: string; fields: Field[] };

const planFields: Field[] = [
  { key: 'active', label: 'Visible en la página', type: 'bool', def: true },
  { key: 'title', label: 'Nombre del plan', type: 'text', placeholder: 'Ej. Pasadía a San Cipriano' },
  { key: 'tagline', label: 'Frase corta', type: 'text', placeholder: 'Ej. Diversión y adrenalina' },
  { key: 'amount', label: 'Precio por persona en pesos (opcional)', type: 'number', help: 'Solo números, ej. 120000. Con este valor funcionan el cotizador y los pagos. Si lo dejas en 0, la tarjeta dice «Cotiza por WhatsApp».' },
  { key: 'price', label: 'Texto de precio (opcional)', type: 'text', placeholder: 'Ej. Desde $120.000 por persona', help: 'Si lo escribes, reemplaza al precio automático en la tarjeta.' },
  { key: 'duration', label: 'Duración', type: 'text', placeholder: 'Ej. 1 día · 2 días y 1 noche' },
  { key: 'dates', label: 'Fechas o salidas', type: 'text', placeholder: 'Ej. Salidas todos los sábados' },
  { key: 'badge', label: 'Etiqueta destacada (opcional)', type: 'text', placeholder: 'Ej. Más vendido' },
  { key: 'featured', label: 'Mostrar primero', type: 'bool', def: false },
  { key: 'image', label: 'Imagen', type: 'image' },
  { key: 'description', label: 'Descripción', type: 'textarea', rows: 3 },
  { key: 'includes', label: 'Qué incluye (una cosa por línea)', type: 'textarea', rows: 4 },
  { key: 'itinerary', label: 'Itinerario (una línea por día o paso)', type: 'textarea', rows: 4 },
  { key: 'whatsappText', label: 'Mensaje de WhatsApp al cotizar', type: 'text', placeholder: '¡Hola! Quiero cotizar este plan…' },
];

export const SECTIONS: SectionDef[] = [
  {
    key: 'settings',
    title: 'Datos del negocio',
    icon: '🏢',
    desc: 'Nombre, logo, contacto, redes, colores y textos para Google.',
    fields: [
      { key: 'h1', label: 'Marca', type: 'heading' },
      { key: 'name', label: 'Nombre de la agencia', type: 'text' },
      { key: 'slogan', label: 'Eslogan', type: 'text' },
      { key: 'tagline', label: 'Descripción corta (ej. «Viajes y planes turísticos»)', type: 'text' },
      { key: 'logo', label: 'Logo', type: 'image', help: 'Mejor un PNG con fondo transparente.' },
      { key: 'primary', label: 'Color principal', type: 'color' },
      { key: 'accent', label: 'Color de botones destacados', type: 'color' },
      { key: 'h2', label: 'Contacto', type: 'heading' },
      { key: 'whatsapp', label: 'WhatsApp (solo números, con indicativo)', type: 'text', placeholder: '573216189634' },
      { key: 'phoneDisplay', label: 'Teléfono para mostrar', type: 'text', placeholder: '+57 321 618 9634' },
      { key: 'email', label: 'Correo', type: 'text' },
      { key: 'address', label: 'Dirección', type: 'text' },
      { key: 'city', label: 'Ciudad / zona', type: 'text' },
      { key: 'mapQuery', label: 'Dirección para el mapa', type: 'text' },
      { key: 'whatsappMessage', label: 'Mensaje inicial de WhatsApp', type: 'text' },
      { key: 'h3', label: 'Redes y registro', type: 'heading' },
      { key: 'instagram', label: 'Instagram (enlace)', type: 'text' },
      { key: 'facebook', label: 'Facebook (enlace)', type: 'text' },
      { key: 'tiktok', label: 'TikTok (enlace)', type: 'text' },
      { key: 'rnt', label: 'Registro Nacional de Turismo (RNT)', type: 'text', help: 'Las agencias de viajes deben mostrarlo. Se ve en el pie de página.' },
      { key: 'h4', label: 'Google (SEO)', type: 'heading' },
      { key: 'siteUrl', label: 'Dirección del sitio (dominio)', type: 'text', placeholder: 'https://yubartatravels.com' },
      { key: 'seoTitle', label: 'Título en Google (máx. 60 caracteres)', type: 'text' },
      { key: 'seoDescription', label: 'Descripción en Google (máx. 155 caracteres)', type: 'textarea', rows: 3 },
      { key: 'ogImage', label: 'Imagen al compartir en redes', type: 'image' },
      { key: 'h5', label: 'Cifras', type: 'heading' },
      { key: 'years', label: 'Años de trayectoria', type: 'text' },
      { key: 'flights', label: 'Vuelos vendidos', type: 'text' },
    ],
  },
  {
    key: 'hero',
    title: 'Portada (carrusel)',
    icon: '🎞️',
    desc: 'Los destinos de la portada. La primera diapositiva es la bienvenida; las siguientes aparecen como tarjetas en movimiento.',
    fields: [
      {
        key: 'slides',
        label: 'Diapositivas',
        type: 'list',
        itemTitle: 'title',
        addLabel: 'Agregar diapositiva',
        fields: [
          { key: 'active', label: 'Visible', type: 'bool', def: true },
          { key: 'region', label: 'Etiqueta pequeña', type: 'text', placeholder: 'Ej. Colombia' },
          { key: 'title', label: 'Título', type: 'text' },
          { key: 'text', label: 'Texto', type: 'textarea', rows: 3 },
          { key: 'image', label: 'Imagen de fondo (horizontal, 1600 px)', type: 'image' },
          { key: 'link', label: 'Enlace del botón', type: 'text', placeholder: '/planes/pasadias' },
          { key: 'linkLabel', label: 'Texto del botón', type: 'text' },
          { key: 'cardRegion', label: 'Tarjeta: etiqueta (opcional)', type: 'text' },
          { key: 'cardTitle', label: 'Tarjeta: título (opcional)', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'categories',
    title: 'Planes y precios',
    icon: '🧳',
    desc: 'Categorías (pasadías, excursiones…) y los planes de cada una. Aquí agregas, editas, ocultas y ordenas.',
    fields: [
      { key: 'title', label: 'Título de la sección', type: 'text' },
      { key: 'intro', label: 'Texto de la sección', type: 'textarea', rows: 2 },
      {
        key: 'items',
        label: 'Categorías',
        type: 'list',
        itemTitle: 'name',
        addLabel: 'Agregar categoría',
        fields: [
          { key: 'name', label: 'Nombre', type: 'text' },
          { key: 'slug', label: 'Dirección en la web (sin tildes ni espacios)', type: 'text', placeholder: 'pasadias', help: 'Ej. pasadias → /planes/pasadias' },
          { key: 'tagline', label: 'Frase corta', type: 'text' },
          { key: 'intro', label: 'Introducción de la página', type: 'textarea', rows: 3 },
          { key: 'image', label: 'Imagen', type: 'image' },
          { key: 'fromAmount', label: 'Precio base por persona para el cotizador (opcional)', type: 'number', help: 'Se usa cuando el cliente elige esta categoría sin un plan concreto. 0 = por confirmar.' },
          { key: 'seoTitle', label: 'Título en Google', type: 'text' },
          { key: 'seoDescription', label: 'Descripción en Google', type: 'textarea', rows: 2 },
          { key: 'plans', label: 'Planes de esta categoría', type: 'list', itemTitle: 'title', addLabel: 'Agregar plan', fields: planFields },
        ],
      },
    ],
  },
  {
    key: 'features',
    title: 'Ventajas',
    icon: '✅',
    desc: 'Las cuatro ventajas que aparecen justo debajo de la portada.',
    fields: [
      {
        key: 'items',
        label: 'Ventajas',
        type: 'list',
        itemTitle: 'title',
        addLabel: 'Agregar ventaja',
        fields: [
          { key: 'icon', label: 'Ícono', type: 'select', def: 'check', options: [['chat', 'Chat'], ['check', 'Check'], ['shield', 'Escudo'], ['heart', 'Corazón'], ['plane', 'Avión'], ['pin', 'Ubicación'], ['bed', 'Cama'], ['ticket', 'Tiquete']] },
          { key: 'title', label: 'Título', type: 'text' },
          { key: 'text', label: 'Texto', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },
  {
    key: 'process',
    title: 'Cómo funciona',
    icon: '🪜',
    desc: 'Los pasos para viajar contigo (se muestran en orden).',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'intro', label: 'Texto', type: 'text' },
      { key: 'steps', label: 'Pasos', type: 'list', itemTitle: 'title', addLabel: 'Agregar paso', fields: [
        { key: 'title', label: 'Título del paso', type: 'text' },
        { key: 'text', label: 'Descripción', type: 'textarea', rows: 2 },
      ] },
    ],
  },
  {
    key: 'quote',
    title: 'Cotizador',
    icon: '🧮',
    desc: 'Textos del cotizador y los extras que el cliente puede sumar (seguro, tiquetes, hotel…). El precio base sale de cada plan o categoría.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'intro', label: 'Texto', type: 'textarea', rows: 3 },
      { key: 'note', label: 'Nota bajo el total', type: 'textarea', rows: 2 },
      { key: 'kidsPercent', label: 'Niños pagan este % del precio de un adulto', type: 'number', def: 100, max: 100, help: '100 = pagan igual. 50 = pagan la mitad.' },
      { key: 'extras', label: 'Extras', type: 'list', itemTitle: 'label', addLabel: 'Agregar extra', fields: [
        { key: 'active', label: 'Visible', type: 'bool', def: true },
        { key: 'id', label: 'Código interno (sin espacios)', type: 'text', placeholder: 'seguro' },
        { key: 'label', label: 'Nombre', type: 'text' },
        { key: 'help', label: 'Descripción corta', type: 'text' },
        { key: 'price', label: 'Precio en pesos (0 = lo confirma un asesor)', type: 'number', def: 0 },
        { key: 'mode', label: 'Cómo se cobra', type: 'select', def: 'persona', options: [['persona', 'Por persona (se multiplica por viajeros)'], ['fijo', 'Valor fijo (una sola vez)']] },
      ] },
    ],
  },
  {
    key: 'payments',
    title: 'Pagos',
    icon: '💳',
    desc: 'Cómo pagan los clientes su abono. Activa solo los medios que ya tengas listos.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'intro', label: 'Texto', type: 'textarea', rows: 2 },
      { key: 'depositPercent', label: 'Abono para separar el cupo (%)', type: 'number', def: 30, max: 100 },
      { key: 'terms', label: 'Texto de condiciones de pago', type: 'textarea', rows: 3 },
      { key: 'methods', label: 'Medios de pago', type: 'list', itemTitle: 'label', addLabel: 'Agregar medio de pago', fields: [
        { key: 'enabled', label: 'Activo (visible para el cliente)', type: 'bool', def: false },
        { key: 'id', label: 'Código interno (sin espacios)', type: 'text', placeholder: 'transfer' },
        { key: 'kind', label: 'Tipo de pago', type: 'select', def: 'link', options: [['whatsapp', 'Coordinar por WhatsApp'], ['link', 'Enlace de pago (Mercado Pago, PayU, Bold…)'], ['transfer', 'Transferencia bancaria'], ['wompi', 'Wompi (pago en línea; requiere claves en el servidor)']] },
        { key: 'label', label: 'Nombre del botón', type: 'text' },
        { key: 'help', label: 'Texto de ayuda', type: 'text' },
        { key: 'link', label: 'Enlace de pago (solo tipo link)', type: 'text', placeholder: 'https://…' },
        { key: 'details', label: 'Datos para transferencia (banco, tipo, número, titular)', type: 'textarea', rows: 4 },
      ] },
    ],
  },
  {
    key: 'cta',
    title: 'Tarjeta «Escríbenos»',
    icon: '💬',
    desc: 'La tarjeta grande con foto junto a los servicios; lleva a WhatsApp.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'text', label: 'Texto', type: 'textarea', rows: 2 },
      { key: 'image', label: 'Foto', type: 'image' },
      { key: 'label', label: 'Texto del botón', type: 'text' },
    ],
  },
  {
    key: 'services',
    title: 'Servicios',
    icon: '🛎️',
    desc: 'Tarjetas de servicios de la página principal.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'intro', label: 'Texto', type: 'textarea', rows: 2 },
      {
        key: 'items',
        label: 'Servicios',
        type: 'list',
        itemTitle: 'title',
        addLabel: 'Agregar servicio',
        fields: [
          { key: 'title', label: 'Nombre', type: 'text' },
          { key: 'text', label: 'Descripción', type: 'textarea', rows: 3 },
          { key: 'image', label: 'Imagen', type: 'image' },
          { key: 'link', label: 'Enlace', type: 'text', placeholder: '/#contacto' },
        ],
      },
    ],
  },
  {
    key: 'about',
    title: 'Quiénes somos',
    icon: '👋',
    desc: 'Texto, foto y cifras de la agencia.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'text', label: 'Texto', type: 'textarea', rows: 6 },
      { key: 'image', label: 'Foto', type: 'image' },
      {
        key: 'stats',
        label: 'Cifras',
        type: 'list',
        itemTitle: 'label',
        addLabel: 'Agregar cifra',
        fields: [
          { key: 'value', label: 'Número', type: 'text', placeholder: '2.000+' },
          { key: 'label', label: 'Descripción', type: 'text', placeholder: 'vuelos vendidos' },
        ],
      },
    ],
  },
  {
    key: 'gallery',
    title: 'Galería',
    icon: '🖼️',
    desc: 'Fotos de viajeros.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      {
        key: 'items',
        label: 'Fotos',
        type: 'list',
        itemTitle: 'alt',
        addLabel: 'Agregar foto',
        fields: [
          { key: 'image', label: 'Foto', type: 'image' },
          { key: 'alt', label: 'Descripción de la foto (para Google y accesibilidad)', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'testimonials',
    title: 'Testimonios',
    icon: '⭐',
    desc: 'Opiniones reales de viajeros. Solo agrega testimonios reales y con permiso.',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'intro', label: 'Texto', type: 'textarea', rows: 2 },
      {
        key: 'items',
        label: 'Testimonios',
        type: 'list',
        itemTitle: 'name',
        addLabel: 'Agregar testimonio',
        fields: [
          { key: 'name', label: 'Nombre', type: 'text' },
          { key: 'trip', label: 'Viaje', type: 'text', placeholder: 'Ej. Cuba' },
          { key: 'text', label: 'Testimonio', type: 'textarea', rows: 4 },
          { key: 'stars', label: 'Estrellas (1 a 5)', type: 'number', def: 5, max: 5 },
        ],
      },
    ],
  },
  {
    key: 'faq',
    title: 'Preguntas frecuentes',
    icon: '❓',
    desc: 'Preguntas y respuestas (también ayudan al posicionamiento en Google).',
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      {
        key: 'items',
        label: 'Preguntas',
        type: 'list',
        itemTitle: 'q',
        addLabel: 'Agregar pregunta',
        fields: [
          { key: 'q', label: 'Pregunta', type: 'text' },
          { key: 'a', label: 'Respuesta', type: 'textarea', rows: 4 },
        ],
      },
    ],
  },
  {
    key: 'legal',
    title: 'Documentos legales',
    icon: '⚖️',
    desc: 'Privacidad, términos, cookies y reembolsos. Son borradores: complétalos y pide revisión a un abogado.',
    fields: [
      {
        key: 'items',
        label: 'Documentos',
        type: 'list',
        itemTitle: 'title',
        addLabel: 'Agregar documento',
        fields: [
          { key: 'title', label: 'Título', type: 'text' },
          { key: 'slug', label: 'Dirección en la web', type: 'text', placeholder: 'politica-de-privacidad' },
          { key: 'version', label: 'Versión', type: 'text', help: 'Si cambias el contenido de fondo, sube la versión.' },
          { key: 'updated', label: 'Fecha de actualización', type: 'text', placeholder: '2026-10-28' },
          { key: 'body', label: 'Contenido', type: 'textarea', rows: 16, help: 'Usa «## Título» para subtítulos y «- » para viñetas. Reemplaza los datos entre [corchetes].' },
        ],
      },
    ],
  },
];

export function blankFor(fields: Field[]): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'heading') continue;
    if (f.def !== undefined) o[f.key] = f.def;
    else if (f.type === 'list') o[f.key] = [];
    else if (f.type === 'bool') o[f.key] = true;
    else if (f.type === 'number') o[f.key] = 0;
    else o[f.key] = '';
  }
  return o;
}
