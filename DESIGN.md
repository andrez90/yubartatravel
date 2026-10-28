# DESIGN
Concepto: portada cinematográfica con tarjetas en movimiento continuo (derecha→izquierda); la que llega al centro se agranda y pasa a ser el fondo del destino.
Color: marino #0b2a3a, primario editable (turquesa #0b6e7a), acento coral #f26b3a, progreso lima #c8e03a, arena #f5f1e8.
Tipografía: Barlow Condensed (títulos) + Inter (texto), servidas desde el propio sitio.
Movimiento: solo transform/opacity, 150–1100 ms, `prefers-reduced-motion` desactiva autoplay y movimiento; botones pausar/anterior/siguiente.
Texto, título y botones del hero están en el HTML inicial (no esperan a JavaScript).
