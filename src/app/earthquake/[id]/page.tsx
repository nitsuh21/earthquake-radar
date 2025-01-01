'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Earthquake } from '@/types/earthquake';
import EarthquakeMapWrapper from '@/components/EarthquakeMapWrapper';

async function getEarthquake(id: string) {
  // Use USGS API for real-time data
  const res = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`);
  if (!res.ok) throw new Error('Failed to fetch earthquakes');
  
  const data = await res.json();
  const earthquake = data.features.find((eq: Earthquake) => eq.id === id);
  
  if (!earthquake) {
    notFound();
  }
  
  return earthquake;
}

export default async function EarthquakePage({
  params,
}: {
  params: { id: string }
}) {
  const earthquake = await getEarthquake(params.id);
  const [longitude, latitude, depth] = earthquake.geometry.coordinates;

  return (
    <main className="min-h-screen p-4">
      <Link 
        href="/"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to all earthquakes
      </Link>

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
          <EarthquakeMapWrapper
            earthquake={earthquake}
            center={[longitude, latitude]}
            zoom={8}
          />
        </div>
      </div>
    </main>
  );
}
