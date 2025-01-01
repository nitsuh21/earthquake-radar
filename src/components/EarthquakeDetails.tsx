'use client';

import { format } from 'date-fns';
import type { Earthquake } from '@/types/earthquake';
import ClientMap from './ClientMap';

interface EarthquakeDetailsProps {
  earthquake: Earthquake;
}

export default function EarthquakeDetails({ earthquake }: EarthquakeDetailsProps) {
  const [longitude, latitude, depth] = earthquake.geometry.coordinates;

  return (
    <main className="min-h-screen p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{earthquake.properties.title}</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Location</h2>
              <p>{earthquake.properties.place}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Time</h2>
              <p>{format(new Date(earthquake.properties.time), 'PPpp')}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Magnitude</h2>
              <p>{earthquake.properties.mag}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Depth</h2>
              <p>{depth} km</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Coordinates</h2>
              <p>Latitude: {latitude}°</p>
              <p>Longitude: {longitude}°</p>
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
          <ClientMap 
            earthquakes={[earthquake]}
            center={[longitude, latitude]}
            zoom={8}
          />
        </div>
      </div>
    </main>
  );
}
