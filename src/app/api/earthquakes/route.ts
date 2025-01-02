import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'earthquake-radar/1.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`USGS API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid data structure received from USGS API');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/earthquakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}
