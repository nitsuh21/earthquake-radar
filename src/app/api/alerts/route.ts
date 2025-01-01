import { NextResponse } from 'next/server';
import type { Earthquake } from '@/types/earthquake';

// Function to calculate risk based on historical data and current seismic activity
function calculateRisk(userLat: number, userLon: number, recentEarthquakes: Earthquake[]) {
  // Simple risk calculation based on:
  // 1. Number of recent earthquakes in the area
  // 2. Magnitude of recent earthquakes
  // 3. Distance from user location
  const radius = 500; // km
  const recentPeriod = 7; // days

  const nearbyQuakes = recentEarthquakes.filter(eq => {
    const [lon, lat] = eq.geometry.coordinates;
    const distance = calculateDistance(userLat, userLon, lat, lon);
    const daysAgo = (Date.now() - new Date(eq.properties.time).getTime()) / (1000 * 60 * 60 * 24);
    return distance <= radius && daysAgo <= recentPeriod;
  });

  const riskScore = nearbyQuakes.reduce((score, eq) => {
    const magnitude = eq.properties.mag;
    return score + (magnitude * magnitude); // Square the magnitude for exponential impact
  }, 0);

  return {
    riskLevel: riskScore > 20 ? 'high' : riskScore > 10 ? 'medium' : 'low',
    nearbyQuakes: nearbyQuakes.length,
    score: riskScore
  };
}

// Haversine formula to calculate distance between two points
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  try {
    // Fetch recent earthquakes from USGS
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
    const data = await res.json();

    // Calculate risk for user's location
    const risk = calculateRisk(lat, lon, data.features);

    return NextResponse.json({
      risk,
      timestamp: new Date().toISOString(),
      location: {
        latitude: lat,
        longitude: lon
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}
