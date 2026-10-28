'use client';

import { useState } from 'react';

/** El mapa de Google solo se carga al hacer clic (no frena la carga de la página). */
export default function MapEmbed({ query }: { query: string }) {
  const [on, setOn] = useState(false);
  const q = encodeURIComponent(query);
  return (
    <div className="map">
      {on ? (
        <iframe
          title="Ubicación en Google Maps"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="map-facade">
          <p>{query}</p>
          <button type="button" className="btn btn-primary" onClick={() => setOn(true)}>
            Ver mapa
          </button>
          <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
            Abrir en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
