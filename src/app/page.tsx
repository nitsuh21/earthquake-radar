import { format } from 'date-fns';
import type { Earthquake } from '@/types/earthquake';
import NotificationHandler from '@/components/NotificationHandler';
import EarthquakeList from '@/components/EarthquakeList';

async function getEarthquakes() {
  try {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://earthquake-radar.vercel.app/api/earthquakes' 
      : 'http://localhost:3000/api/earthquakes';
    
    const res = await fetch(apiUrl, { 
      next: { revalidate: 300 },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      console.error(`API responded with status: ${res.status}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) {
      console.error('Invalid data structure received:', data);
      throw new Error('Invalid data structure received from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    throw error; 
  }
}

export default async function Home() {
  let earthquakes: Earthquake[] = [];
  let error: string | null = null;

  try {
    const data = await getEarthquakes();
    earthquakes = data.features;
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {earthquakes.length > 0 && <NotificationHandler earthquakes={earthquakes} />}
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Recent Earthquakes</h1>
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(), 'PPp')}
          </div>
        </div>

        {earthquakes.length > 0 ? (
          <EarthquakeList earthquakes={earthquakes} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {error || 'No earthquake data available at the moment. Please try again later.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}