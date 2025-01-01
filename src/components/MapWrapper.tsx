'use client';

import dynamic from 'next/dynamic';
import type { Earthquake } from '@/types/earthquake';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false
});

interface MapWrapperProps {
  earthquakes: Earthquake[];
  center?: [number, number];
  zoom?: number;
}

export default function MapWrapper({ earthquakes, center, zoom }: MapWrapperProps) {
  return (
    <div className="h-full w-full">
      <MapWithNoSSR 
        earthquakes={earthquakes} 
        center={center} 
        zoom={zoom} 
      />
    </div>
  );
}