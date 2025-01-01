import { useEffect, useCallback, useState } from 'react';
import type { Earthquake } from '@/types/earthquake';

interface ForecastAlert {
  id: string;
  probability: number;
  magnitude: number;
  location: string;
  timeframe: string;
  coordinates: [number, number];
}

export function useEarthquakeNotifications(earthquakes: Earthquake[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; country: string } | null>(null);
  const [forecasts, setForecasts] = useState<ForecastAlert[]>([]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Get user's location and country
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get country from coordinates using reverse geocoding
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          
          setUserLocation({
            lat: latitude,
            lon: longitude,
            country: data.countryCode
          });
        } catch (error) {
          console.error('Failed to get location details:', error);
        }
      });
    }
  }, []);

  // Fetch and handle forecasts
  useEffect(() => {
    if (!userLocation) return;

    async function checkForecasts() {
      try {
        const res = await fetch(
          `/api/forecasts?country=${userLocation?.country}&lat=${userLocation?.lat}&lon=${userLocation?.lon}`
        );
        const data = await res.json();
        
        if (data.forecasts?.length > 0) {
          setForecasts(data.forecasts);
          
          if (permission === 'granted') {
            // Show notification for high-probability forecasts
            data.forecasts.forEach((forecast: ForecastAlert) => {
              if (forecast.probability >= 0.7) { // 70% or higher probability
                new Notification('Earthquake Forecast Alert!', {
                  body: `High probability of M${forecast.magnitude.toFixed(1)} earthquake near ${forecast.location} within ${forecast.timeframe}`,
                  icon: '/earthquake-icon.png',
                  tag: `forecast-${forecast.id}`
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch forecasts:', error);
      }
    }

    checkForecasts();
    const interval = setInterval(checkForecasts, 30 * 60 * 1000); // Check every 30 minutes
    return () => clearInterval(interval);
  }, [userLocation, permission]);

  // Handle real-time significant earthquakes
  useEffect(() => {
    if (typeof window === 'undefined' || permission !== 'granted') {
      return;
    }

    const significantEarthquakes = earthquakes.filter(
      eq => eq.properties.mag >= 5.0
    );

    significantEarthquakes.forEach(eq => {
      new Notification('Significant Earthquake Detected!', {
        body: `Magnitude ${eq.properties.mag} earthquake near ${eq.properties.place}`,
        icon: '/earthquake-icon.png',
        tag: eq.id
      });
    });
  }, [earthquakes, permission]);

  return {
    permission,
    requestPermission,
    forecasts,
    userLocation
  };
}
