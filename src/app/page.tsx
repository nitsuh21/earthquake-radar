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
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    return { features: [] }; // Return empty features array as fallback
  }
}

export default async function Home() {
  const data = await getEarthquakes();
  const earthquakes: Earthquake[] = data.features;

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <NotificationHandler earthquakes={earthquakes} />
        
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
            <p className="text-gray-500">Unable to load earthquake data. Please try again later.</p>
          </div>
        )}
      </div>
    </main>
  );
}