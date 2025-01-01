import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import ClientMap from '@/components/ClientMap';

async function getEarthquake(id: string) {
  // Use USGS API for real-time data
  const res = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`);
  if (!res.ok) throw new Error('Failed to fetch earthquakes');
  
  const data = await res.json();
  const earthquake = data.features.find((eq: any) => eq.id === id);
  
  if (!earthquake) {
    notFound();
  }
  
  return earthquake;
}

export default async function EarthquakePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const earthquake = await getEarthquake(params.id);
  const [longitude, latitude, depth] = earthquake.geometry.coordinates;

  return (
    <main className="min-h-screen p-4">
      <Link 
        href="/"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to all earthquakes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h1 className="text-2xl font-bold mb-4">{earthquake.properties.place}</h1>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm text-gray-600">Magnitude</h2>
                <p className="text-xl font-semibold">{earthquake.properties.mag}</p>
              </div>
              <div>
                <h2 className="text-sm text-gray-600">Depth</h2>
                <p className="text-xl font-semibold">{depth.toFixed(1)} km</p>
              </div>
              <div>
                <h2 className="text-sm text-gray-600">Time</h2>
                <p className="text-xl font-semibold">
                  {format(new Date(earthquake.properties.time), 'PPp')}
                </p>
              </div>
              <div>
                <h2 className="text-sm text-gray-600">Status</h2>
                <p className="text-xl font-semibold capitalize">{earthquake.properties.status}</p>
              </div>
            </div>

            {earthquake.properties.tsunami > 0 && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                ⚠️ Tsunami alert issued for this earthquake
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{earthquake.properties.type}</span>
              </p>
              <p>
                <span className="font-medium">Alert Level:</span>{' '}
                <span className="capitalize">{earthquake.properties.alert || 'None'}</span>
              </p>
              <p>
                <a 
                  href={earthquake.properties.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on USGS Website →
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <ClientMap 
            earthquakes={[earthquake]}
            center={[longitude, latitude]}
            zoom={8}
          />
        </div>
      </div>
    </main>
  );
}
