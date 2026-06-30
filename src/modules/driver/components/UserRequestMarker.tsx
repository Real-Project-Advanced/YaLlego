'use client';

import L from 'leaflet';

export const createUserRequestMarkerIcon = () =>
  L.divIcon({
    className: 'user-request-marker-icon',
    html: `
      <div style="
        width: 42px; height: 42px;
        display: grid; place-items: center;
        border-radius: 50%;
        border: 3px solid white;
        background: #0369a1;
        color: white;
        font-size: 20px;
        box-shadow: 0 12px 26px rgba(15,23,42,0.28);
      ">👤</div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
