'use client';

import dynamic from 'next/dynamic';
import type { Earthquake } from '@/types/earthquake';

const DynamicMap = dynamic(() => import('@/components/ClientMap'), { ssr: false });

interface EarthquakeMapSectionProps {
  earthquake: Earthquake;
}

export default function EarthquakeMapSection({ earthquake }: EarthquakeMapSectionProps) {
  const [longitude, latitude] = earthquake.geometry.coordinates;

  return (
    <div className="h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      <DynamicMap 
        earthquakes={[earthquake]}
        center={[longitude, latitude]}
        zoom={8}
      />
    </div>
  );
}
