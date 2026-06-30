'use client';

import L from 'leaflet';

export const createBusMarkerIcon = (driverCode: string, isHighlighted = false, label = '') =>
  L.divIcon({
    className: 'bus-marker-icon',
    html: `
      <div style="position: relative; width: 48px; height: 58px;">
        ${
          label
            ? `<span style="
                position: absolute;
                left: 50%;
                top: -22px;
                transform: translateX(-50%);
                white-space: nowrap;
                border-radius: 999px;
                border: 2px solid white;
                background: #047857;
                padding: 3px 8px;
                color: white;
                font-size: 10px;
                font-weight: 950;
                line-height: 1;
                box-shadow: 0 10px 20px rgba(15,23,42,0.24);
              ">${label}</span>`
            : ''
        }
        <div style="
          width: 48px; height: 48px;
          background: #1a1a2e;
          border-radius: 50%;
          border: 3px solid white;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: white; font-size: 18px;
          box-shadow: ${isHighlighted ? '0 0 0 7px rgba(16,185,129,0.28), 0 16px 30px rgba(0,0,0,0.34)' : '0 4px 12px rgba(0,0,0,0.3)'};
          transition: transform 420ms ease, box-shadow 420ms ease;
        ">
          🚌
          <span style="font-size: 9px; font-weight: 900; margin-top: -2px;">
            ${driverCode}
          </span>
        </div>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 34],
    popupAnchor: [0, -28],
  });
