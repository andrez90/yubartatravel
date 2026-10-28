# Matriz de cumplimiento (borrador, requiere revisión de abogado)

Cifras y normas por verificar vigencia antes de publicar. Este documento no certifica cumplimiento.

| Norma | Requisito | Dónde se cumple | Estado | ¿Abogado? |
|---|---|---|---|---|
| Ley 1581/2012 y Decretos 1377/2013 y 1074/2015 | Autorización previa, política de tratamiento, derechos del titular | `/legal/politica-de-privacidad`, casillas separadas en el formulario | Parcial: faltan razón social, NIT y correo | Sí |
| Cookies (aplica Ley 1581 si hay datos personales) | Consentimiento previo; aceptar/rechazar/configurar con igual peso | `CookieBanner`; GA4 solo carga tras aceptar | Hecho (probar con Tag Assistant) | Sí |
| Ley 1480/2011 y Ley 2439/2024 | Información al consumidor, retracto, reversión de pago | `/legal/terminos-y-condiciones`, `/legal/politica-de-reembolsos` | Parcial: exclusiones propias del turismo por confirmar | Sí |
| Ley 527/1999 | Valor probatorio de mensajes de datos | Tabla `consent_logs` (solo inserción, hash del texto, IP, versión) | Hecho | Sí |
| Ley 2300/2023 | Horarios y canal al contactar con fines comerciales | Casilla de marketing opcional y separada | Parcial: definir horario de contacto | Sí |
| Registro Nacional de Bases de Datos (SIC) | Verificar si la empresa está obligada | — | Pendiente | Sí |
| Ley 2068/2020 (turismo) y RNT | Agencias de viajes deben tener RNT activo y mostrarlo | Campo RNT en el panel → pie de página | Pendiente: dueño debe ingresarlo | Sí |
| DIAN / SIC | Facturación electrónica y publicidad | Fuera del sitio | Pendiente | Sí |
