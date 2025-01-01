'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ClientMap from '@/components/ClientMap';
import MagnitudeSlider from '@/components/MagnitudeSlider';
import type { Earthquake } from '@/types/earthquake';

interface Forecast {
  id: string;
  mainshock: {
    magnitude: number;
    place: string;
    time: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  forecast: {
    timeWindow: string;
    magnitude: {
      probability: number;
      value: number;
    };
    numAftershocks: number;
    aftershockSequence: any[];
  };
}

const transformForecastToEarthquake = (forecast: any): Earthquake => ({
  id: forecast.id || Math.random().toString(),
  properties: {
    mag: forecast.properties.mag || forecast.mainshock?.magnitude || 0,
    place: forecast.properties.place || forecast.mainshock?.place || 'Unknown Location',
    time: forecast.properties.time || forecast.mainshock?.time || Date.now(),
    url: `https://earthquake.usgs.gov/earthquakes/eventpage/${forecast.id}`,
    title: forecast.properties.place || forecast.mainshock?.place || 'Unknown Location',
    alert: null,
    depth: 10,
    status: 'forecast',
    tsunami: 0,
    type: 'forecast'
  },
  mag: forecast.properties.mag || forecast.mainshock?.magnitude || 0,
  place: forecast.properties.place || forecast.mainshock?.place || 'Unknown Location',
  time: forecast.properties.time || forecast.mainshock?.time || Date.now(),
  url: `https://earthquake.usgs.gov/earthquakes/eventpage/${forecast.id}`,
  title: forecast.properties.place || forecast.mainshock?.place || 'Unknown Location',
  alert: null,
  depth: 10,
  status: 'forecast',
  tsunami: 0,
  type: 'forecast'
});

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [minMagnitude, setMinMagnitude] = useState(0);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const response = await fetch('/api/forecasts');
        if (!response.ok) throw new Error('Failed to fetch forecasts');
        const data = await response.json();
        setForecasts(data);
      } catch (error) {
        console.error('Error fetching forecasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  const filteredForecasts = forecasts.filter(
    forecast => forecast.mainshock.magnitude >= minMagnitude
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Earthquake Forecasts</h1>
      
      <div className="mb-6">
        <MagnitudeSlider value={minMagnitude} onChange={setMinMagnitude} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
          <ClientMap
            earthquakes={filteredForecasts.flatMap(f => 
              f.forecast.aftershockSequence.map(transformForecastToEarthquake)
            )}
            center={selectedForecast 
              ? [selectedForecast.location.longitude, selectedForecast.location.latitude]
              : undefined}
            zoom={selectedForecast ? 8 : 3}
          />
        </div>

        <div className="space-y-4">
          {filteredForecasts.map((forecast) => (
            <div
              key={forecast.id}
              className={`p-6 rounded-lg shadow-md cursor-pointer transition-colors
                ${selectedForecast?.id === forecast.id 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setSelectedForecast(forecast)}
            >
              <h3 className="text-xl font-semibold mb-2">
                {forecast.mainshock.place}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Main Shock</p>
                  <p>Magnitude: {forecast.mainshock.magnitude}</p>
                  <p>Time: {format(forecast.mainshock.time, 'PPp')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Forecast</p>
                  <p>Time Window: {forecast.forecast.timeWindow}</p>
                  <p>Probability: {(forecast.forecast.magnitude.probability * 100).toFixed(1)}%</p>
                  <p>Expected Aftershocks: {forecast.forecast.numAftershocks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}