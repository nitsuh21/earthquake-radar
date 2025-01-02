import { NextResponse } from 'next/server';

const USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tsunami: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
}

interface EarthquakeData {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

const fetchWithTimeout = async (
  url: string,
  options?: RequestInit,
  timeout: number = 5000
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

export async function GET() {
  const today = new Date();
  const startTime = new Date(today.setHours(0, 0, 0, 0)).toISOString();

  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startTime,
    minmagnitude: '3.0',
  });

  try {
    const response = await fetchWithTimeout(`${USGS_API_URL}?${params}`, {
      headers: { 'User-Agent': 'EarthquakeRadar/1.0 (example@example.com)' },
    });

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.statusText}`);
    }

    const data: EarthquakeData = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}
