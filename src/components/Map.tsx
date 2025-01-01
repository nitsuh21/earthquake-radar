'use client';

import { useRef, useState } from 'react';
import Map, { 
  Marker, 
  Popup, 
  GeolocateControl, 
  NavigationControl,
  FullscreenControl,
  ScaleControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Earthquake } from '@/types/earthquake';
import { format } from 'date-fns';
import Link from 'next/link';

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  onEarthquakeClick?: (earthquake: Earthquake) => void;
  center?: [number, number];
  zoom?: number;
  showAlertsButton?: boolean;
}

export default function EarthquakeMap({ 
  earthquakes, 
  onEarthquakeClick,
  center,
  zoom = 2,
  showAlertsButton = true
}: EarthquakeMapProps) {
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const mapRef = useRef(null);

  const initialViewState = {
    longitude: center?.[0] ?? 0,
    latitude: center?.[1] ?? 20,
    zoom: zoom
  };

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        reuseMaps
      >
        {/* Add Map Controls */}
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          showUserHeading
          position="top-right"
        />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {showAlertsButton && (
          <Link href="/alerts" className="absolute top-4 right-4 z-10">
            <button className="px-4 py-2 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors">
              View Alerts
            </button>
          </Link>
        )}

        {earthquakes.map((eq) => (
          <Marker
            key={eq.id}
            longitude={eq.geometry.coordinates[0]}
            latitude={eq.geometry.coordinates[1]}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedEarthquake(eq);
              if (onEarthquakeClick) onEarthquakeClick(eq);
            }}
          >
            <div className="relative cursor-pointer group">
              <div className={`w-4 h-4 rounded-full ${
                eq.properties.mag >= 6 ? 'bg-red-500' :
                eq.properties.mag >= 4.5 ? 'bg-orange-500' :
                'bg-yellow-500'
              }`} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                M{eq.properties.mag.toFixed(1)}
              </div>
            </div>
          </Marker>
        ))}

        {selectedEarthquake && (
          <Popup
            longitude={selectedEarthquake.geometry.coordinates[0]}
            latitude={selectedEarthquake.geometry.coordinates[1]}
            onClose={() => setSelectedEarthquake(null)}
            closeOnClick={false}
          >
            <div className="p-3 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2 text-black">{selectedEarthquake.properties.place}</h3>
              <div className="space-y-1">
                <p className="flex justify-between text-black">
                  <span className="text-gray-600">Magnitude:</span>
                  <span className="font-semibold">{selectedEarthquake.properties.mag.toFixed(1)}</span>
                </p>
                <p className="flex justify-between text-black">
                  <span className="text-gray-600">Depth:</span>
                  <span className="font-semibold">{selectedEarthquake.geometry.coordinates[2].toFixed(1)} km</span>
                </p>
                <p className="flex justify-between text-black">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{format(new Date(selectedEarthquake.properties.time), 'PPp')}</span>
                </p>
              </div>
              <a
                href={selectedEarthquake.properties.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center bg-black text-white py-1 px-3 rounded hover:bg-gray-800 transition-colors"
              >
                View Details
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
