'use client';

import ClientMap from '@/components/ClientMap';
import type { Earthquake } from '@/types/earthquake';

interface EarthquakeMapWrapperProps {
  earthquake: Earthquake;
  center: [number, number];
  zoom: number;
}

export default function EarthquakeMapWrapper({ earthquake, center, zoom }: EarthquakeMapWrapperProps) {
  return (
    <ClientMap 
      earthquakes={[earthquake]} 
      center={center} 
      zoom={zoom} 
    />
  );
}
