'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Earthquake } from '@/types/earthquake';

interface ClientMapProps {
  earthquakes: Earthquake[];
  center?: [number, number];
  zoom?: number;
  showAlertsButton?: boolean;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export default function ClientMap({ 
  earthquakes,
  center = [-95, 37],
  zoom = 3
}: Omit<ClientMapProps, 'showAlertsButton'>) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current) return;

    earthquakes.forEach((earthquake) => {
      const [longitude, latitude] = earthquake.geometry.coordinates;
      const magnitude = earthquake.properties.mag;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = `${Math.max(magnitude * 5, 10)}px`;
      el.style.height = `${Math.max(magnitude * 5, 10)}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = magnitude >= 6 ? '#ef4444' : 
                               magnitude >= 5 ? '#f97316' : 
                               magnitude >= 4 ? '#f59e0b' : '#fbbf24';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="text-black">
          <h3 class="font-semibold">M${magnitude.toFixed(1)} Earthquake</h3>
          <p>${earthquake.properties.place}</p>
          <p class="text-sm mt-1">${new Date(earthquake.properties.time).toLocaleString()}</p>
          ${earthquake.properties.tsunami ? 
            '<p class="text-red-600 font-semibold mt-1">⚠️ Tsunami Warning</p>' : ''}
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [earthquakes]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
