'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Earthquake } from '@/types/earthquake';
import { useEarthquakeNotifications } from '@/hooks/useEarthquakeNotifications';

interface Forecast {
  id: string;
  mainshock: {
    magnitude: number;
    place: string;
  };
  forecast: {
    magnitude: {
      probability: number;
      value: number;
    };
  };
}

export default function NotificationHandler({ 
  earthquakes 
}: { 
  earthquakes: Earthquake[] 
}) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const { permission, requestPermission } = useEarthquakeNotifications(earthquakes);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

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
            const data = await res.json();
            const highProbForecasts = data.forecasts.filter(
              (f: Forecast) => f.forecast.magnitude.probability >= 0.7
            );
            setForecasts(highProbForecasts);
          } catch (error) {
            console.error('Failed to fetch forecasts:', error);
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!userLocation) {
    return (
      <div className="bg-white border-l-4 border-black p-4 mb-4">
        <p className="text-black">
          Enable location services to get earthquake alerts for your area.
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-white border-l-4 border-black p-4 mb-4">
        <p className="text-black">
          Enable notifications to get alerts for earthquake forecasts and significant events.
        </p>
      </div>
    );
  }

  if (forecasts.length > 0) {
    return (
      <Link href="/alerts" className="block">
        <div className="bg-white border-l-4 border-black p-4 mb-4 hover:bg-gray-50 transition-colors">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-black">
                Earthquake Alerts Available
              </h3>
              <div className="mt-2 text-sm text-black">
                <p>
                  {forecasts.length} high-probability alert{forecasts.length > 1 ? 's' : ''} in your area
                </p>
                <ul className="list-disc list-inside mt-1">
                  {forecasts.slice(0, 2).map(forecast => (
                    <li key={forecast.id} className="text-black">
                      {forecast.mainshock.place} - {(forecast.forecast.magnitude.probability * 100).toFixed(0)}% chance of M{forecast.forecast.magnitude.value.toFixed(1)}+
                    </li>
                  ))}
                  {forecasts.length > 2 && (
                    <li className="text-black">...and {forecasts.length - 2} more</li>
                  )}
                </ul>
              </div>
              <p className="text-sm text-black mt-2 font-medium">
                Click to view detailed alert information →
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null;
}
