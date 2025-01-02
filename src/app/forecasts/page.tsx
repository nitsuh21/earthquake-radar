'use client';

import { useEffect, useState } from 'react';
import ClientMap from '@/components/ClientMap';
import MagnitudeSlider from '@/components/MagnitudeSlider';
import { Earthquake } from '@/types/earthquake';
import React from 'react';

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
    depth: number;
  };
  forecast: {
    magnitude: {
      value: number;
      probability: number;
    };
    timeWindow: string;
    numAftershocks: number;
  };
}

function transformForecastToEarthquake(forecast: Forecast): Earthquake {
  return {
    id: forecast.id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [forecast.location.longitude, forecast.location.latitude, forecast.location.depth || 10]
    },
    properties: {
      mag: forecast.forecast.magnitude.value,
      place: forecast.mainshock.place,
      time: forecast.mainshock.time,
      sig: forecast.mainshock.magnitude.toString(),
      url: '',
      title: `M${forecast.forecast.magnitude.value} - ${forecast.mainshock.place}`,
      alert: null,
      depth: forecast.location.depth || 10,
      status: 'forecast',
      tsunami: 0,
      type: 'forecast'
    }
  };
}

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [minMagnitude, setMinMagnitude] = useState(3);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });

          try {
            const res = await fetch(
              `/api/forecasts?lat=${latitude}&lon=${longitude}&radius=500`
            );
            if (!res.ok) throw new Error('Failed to fetch forecasts');
            const data = await res.json();
            setForecasts(data.forecasts || []);
          } catch (error) {
            console.error('Error fetching forecasts:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: 37.0902, lon: -95.7129 });
        }
      );
    }
  }, []);

  const filteredForecasts = forecasts.filter(
    (forecast) => forecast.forecast.magnitude.value >= minMagnitude
  );

  if (!userLocation) {
    return <div className="p-4">Loading location...</div>;
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Earthquake Forecasts</h1>
      
      <div className="mb-4">
        <MagnitudeSlider
          value={minMagnitude}
          onChange={setMinMagnitude}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-[600px]">
          <ClientMap
            earthquakes={filteredForecasts.map(transformForecastToEarthquake)}
            center={[userLocation.lon, userLocation.lat]}
            zoom={4}
          />
        </div>
      </div>
      
      <div className="mt-8 grid gap-4">
        {filteredForecasts.map((forecast) => (
          <div key={forecast.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">
              {forecast.mainshock.place}
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Forecast Magnitude</p>
                <p className="font-medium">M{forecast.forecast.magnitude.value}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Probability</p>
                <p className="font-medium">
                  {(forecast.forecast.magnitude.probability * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Window</p>
                <p className="font-medium">{forecast.forecast.timeWindow}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Aftershocks</p>
                <p className="font-medium">{forecast.forecast.numAftershocks}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
