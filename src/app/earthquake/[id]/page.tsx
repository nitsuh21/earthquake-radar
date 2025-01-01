import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Earthquake } from '@/types/earthquake';
import EarthquakeDetails from '@/components/EarthquakeDetails';

async function getEarthquake(id: string) {
  const res = await fetch(
    `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`,
    { next: { revalidate: 60 } }
  );
  
  if (!res.ok) throw new Error('Failed to fetch earthquakes');

  const data = await res.json();
  const earthquake = data.features.find((eq: Earthquake) => eq.id === id);

  if (!earthquake) {
    notFound();
  }

  return earthquake;
}

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const earthquake = await getEarthquake(params.id);

  return (
    <>
      <Link 
        href="/"
        className="inline-block mb-6 text-blue-600 hover:underline mx-4 mt-4"
      >
        ← Back to all earthquakes
      </Link>
      <EarthquakeDetails earthquake={earthquake} />
    </>
  );
}
