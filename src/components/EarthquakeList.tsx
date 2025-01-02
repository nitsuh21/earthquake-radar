'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { Earthquake } from '@/types/earthquake';
import SearchBar from './SearchBar';
import MagnitudeSlider from './MagnitudeSlider';
import dynamic from 'next/dynamic';

const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false
});

interface EarthquakeListProps {
  earthquakes: Earthquake[];
}

export default function EarthquakeList({ earthquakes: initialEarthquakes }: EarthquakeListProps) {
  const [filteredEarthquakes, setFilteredEarthquakes] = useState(initialEarthquakes);
  const [searchQuery, setSearchQuery] = useState('');
  const [minMagnitude, setMinMagnitude] = useState(3);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = (location: string) => {
    setSearchQuery(location);
    filterEarthquakes(location, minMagnitude);
  };

  const handleMagnitudeFilter = (magnitude: number) => {
    setMinMagnitude(magnitude);
    filterEarthquakes(searchQuery, magnitude);
  };

  const filterEarthquakes = (location: string, magnitude: number) => {
    let filtered = initialEarthquakes.filter(eq => eq.properties.mag >= magnitude);
    
    if (location.trim()) {
      const searchTerm = location.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.properties.place.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredEarthquakes(filtered);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="flex flex-col items-end mb-4">
        <MagnitudeSlider value={minMagnitude} onChange={handleMagnitudeFilter} />
        <SearchBar onSearch={handleSearch} onMagnitudeFilter={handleMagnitudeFilter} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
          <MapWrapper earthquakes={filteredEarthquakes} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Earthquake List</h2>
            <span className="text-sm text-gray-500">{filteredEarthquakes.length} events</span>
          </div>
          
          <div className="overflow-auto max-h-[540px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-3">
              {filteredEarthquakes.map((eq) => (
                <div 
                  key={eq.id}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(eq.id)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{eq.properties.place}</h2>
                    <span className={`
                      px-3 py-1 rounded-full text-white text-sm font-medium
                      ${eq.properties.mag >= 6 ? 'bg-red-600' : 
                        eq.properties.mag >= 5 ? 'bg-red-500' : 
                        eq.properties.mag >= 4 ? 'bg-orange-500' : 'bg-yellow-500'}
                    `}>
                      M {eq.properties.mag.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>{format(new Date(eq.properties.time), 'PPp')}</span>
                    <span>Depth: {eq.geometry.coordinates[2].toFixed(1)} km</span>
                  </div>
                  
                  {expandedId === eq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-red-500">Coordinates</p>
                          <p className="font-medium text-gray-900">{eq.geometry.coordinates[1].toFixed(4)}° N, {eq.geometry.coordinates[0].toFixed(4)}° E</p>
                        </div>
                        <div>
                          <p className="text-red-500">Significance</p>
                          <p className="font-medium text-gray-900">{eq.properties.sig}</p>
                        </div>
                        <div>
                          <p className="text-red-500">Status</p>
                          <p className="font-medium text-gray-900 capitalize">{eq.properties.status}</p>
                        </div>
                        <div>
                          <p className="text-red-500">Type</p>
                          <p className="font-medium text-gray-900 capitalize">{eq.properties.type}</p>
                        </div>
                        {eq.properties.tsunami > 0 && (
                          <div className="col-span-2">
                            <p className="text-red-600 font-medium">⚠️ Tsunami Alert</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-gray-600">More Info</p>
                          <a 
                            href={eq.properties.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on USGS
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
