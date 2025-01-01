import { NextResponse } from 'next/server';

// USGS Endpoints
const ENDPOINTS = {
  // Main forecast endpoint for aftershocks
  AFTERSHOCK_FORECAST: 'https://earthquake.usgs.gov/ws/forecast/',
  // Recent significant earthquakes that might trigger aftershocks
  SIGNIFICANT_WEEK: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const radius = parseFloat(searchParams.get('radius') || '500'); // km

  try {
    // 1. Get recent significant earthquakes
    const sigResponse = await fetch(ENDPOINTS.SIGNIFICANT_WEEK);
    const sigData = await sigResponse.json();

    // Filter earthquakes within radius
    const nearbySignificant = sigData.features.filter((eq: any) => {
      const eqLat = eq.geometry.coordinates[1];
      const eqLon = eq.geometry.coordinates[0];
      const distance = calculateDistance(lat, lon, eqLat, eqLon);
      return distance <= radius;
    });

    // 2. Get aftershock forecasts for each nearby significant earthquake
    const forecasts = await Promise.all(
      nearbySignificant.map(async (eq: any) => {
        const forecastUrl = `${ENDPOINTS.AFTERSHOCK_FORECAST}/mainshock/${eq.id}`;
        try {
          const forecastRes = await fetch(forecastUrl);
          const forecastData = await forecastRes.json();
          
          return {
            id: eq.id,
            mainshock: {
              magnitude: eq.properties.mag,
              place: eq.properties.place,
              time: eq.properties.time
            },
            location: {
              latitude: eq.geometry.coordinates[1],
              longitude: eq.geometry.coordinates[0]
            },
            forecast: {
              timeWindow: forecastData.forecast.timeWindow,
              magnitude: {
                probability: forecastData.forecast.magnitude.probability,
                value: forecastData.forecast.magnitude.value
              },
              numAftershocks: forecastData.forecast.numAftershocks,
              aftershockSequence: forecastData.forecast.sequence
            }
          };
        } catch (error) {
          console.error(`Failed to fetch forecast for earthquake ${eq.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed forecasts and sort by probability
    const validForecasts = forecasts
      .filter(f => f !== null)
      .sort((a: any, b: any) => 
        b.forecast.magnitude.probability - a.forecast.magnitude.probability
      );

    return NextResponse.json({
      forecasts: validForecasts,
      timestamp: new Date().toISOString(),
      location: { latitude: lat, longitude: lon }
    });

  } catch (error) {
    console.error('Failed to fetch earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
