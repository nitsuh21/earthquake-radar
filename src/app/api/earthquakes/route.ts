import { NextResponse } from 'next/server';

const USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export async function GET() {
  const today = new Date();
  const startTime = new Date(today.setHours(0, 0, 0, 0)).toISOString();

  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startTime,
    minmagnitude: '3.0',
  });

  try {
    const response = await fetch(`${USGS_API_URL}?${params}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}
