import { format } from 'date-fns';
import type { Earthquake } from '@/types/earthquake';
import NotificationHandler from '@/components/NotificationHandler';
import EarthquakeList from '@/components/EarthquakeList';

async function getEarthquakes() {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com/api/earthquakes' 
    : 'http://localhost:3000/api/earthquakes';
  
  const res = await fetch(apiUrl, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch earthquakes');
  return res.json();
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

        <EarthquakeList earthquakes={earthquakes} />
      </div>
    </main>
  );
}