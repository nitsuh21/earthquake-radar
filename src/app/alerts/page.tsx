'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ClientMap from '@/components/ClientMap';

interface RiskAlert {
  riskLevel: 'high' | 'medium' | 'low';
  nearbyQuakes: number;
  score: number;
  description: string;
  recommendations: string[];
}

interface Forecast {
  id: string;
  mainshock: {
    magnitude: number;
    place: string;
    time: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  forecast: {
    timeWindow: string;
    magnitude: {
      probability: number;
      value: number;
    };
    numAftershocks: number;
    aftershockSequence: any[];
  };
}

export default function AlertsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [riskAlert, setRiskAlert] = useState<RiskAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });

          try {
            // Fetch forecasts
            const forecastRes = await fetch(
              `/api/forecasts?lat=${latitude}&lon=${longitude}&radius=500`
            );
            const forecastData = await forecastRes.json();
            setForecasts(forecastData.forecasts);

            // Fetch risk assessment
            const riskRes = await fetch(`/api/alerts?lat=${latitude}&lon=${longitude}`);
            const riskData = await riskRes.json();
            setRiskAlert({
              ...riskData.risk,
              description: getRiskDescription(riskData.risk.riskLevel),
              recommendations: getRiskRecommendations(riskData.risk.riskLevel)
            });
          } catch (error) {
            console.error('Failed to fetch data:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Failed to get location:', error);
          setLoading(false);
        }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-black">Loading alert data...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-black mb-4">Location Access Required</h2>
          <p className="text-black">
            Please enable location services to view earthquake alerts for your area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Earthquake Alerts</h1>
          <p className="mt-2 text-black">
            Real-time seismic activity monitoring for your location
          </p>
        </div>

        {riskAlert && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Current Risk Assessment</h2>
              <span className={`px-4 py-2 rounded-full text-white font-medium ${
                riskAlert.riskLevel === 'high' ? 'bg-red-600' :
                riskAlert.riskLevel === 'medium' ? 'bg-orange-500' :
                'bg-green-500'
              }`}>
                {riskAlert.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            
            <div className="space-y-4">
              <p className="text-black text-lg">{riskAlert.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-black mb-2">Key Information:</h3>
                <ul className="list-disc list-inside space-y-1 text-black">
                  <li>Detected {riskAlert.nearbyQuakes} earthquakes within 500km in the last 7 days</li>
                  <li>Cumulative seismic risk score: {riskAlert.score.toFixed(1)}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-black mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1 text-black">
                  {riskAlert.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[600px]">
              <ClientMap
                earthquakes={forecasts.map((forecast) => ({
                  id: forecast.id,
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [forecast.location.longitude, forecast.location.latitude, 10]
                  },
                  properties: {
                    mag: forecast.forecast.magnitude.value,
                    place: forecast.mainshock.place,
                    time: forecast.mainshock.time,
                    url: '',  
                    title: `M${forecast.forecast.magnitude.value} - ${forecast.mainshock.place}`,
                    alert: null,
                    depth: 10,  
                    status: 'forecast',
                    tsunami: 0,
                    type: 'forecast'
                  }
                }))}
                center={[userLocation.lon, userLocation.lat]}
                zoom={6}
                showAlertsButton={false}
              />
            </div>
          </div>

          <div className="space-y-4">
            {forecasts.length > 0 ? (
              forecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-black"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">
                      {forecast.mainshock.place}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      forecast.forecast.magnitude.probability >= 0.7 
                        ? 'bg-red-100 text-black' 
                        : forecast.forecast.magnitude.probability >= 0.4 
                        ? 'bg-orange-100 text-black' 
                        : 'bg-yellow-100 text-black'
                    }`}>
                      {(forecast.forecast.magnitude.probability * 100).toFixed(0)}% Probability
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-black">Main Shock</p>
                      <p className="text-lg text-black">M{forecast.mainshock.magnitude.toFixed(1)}</p>
                      <p className="text-sm text-black">
                        {format(new Date(forecast.mainshock.time), 'PPp')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">Expected Aftershocks</p>
                      <p className="text-lg text-black">{forecast.forecast.numAftershocks}</p>
                      <p className="text-sm text-black">within {forecast.forecast.timeWindow}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-black">No Significant Earthquakes</h3>
                <p className="mt-2 text-black">
                  While there may be minor seismic activity in your area, there are currently no significant earthquakes (M4.5+) that require immediate attention. Continue monitoring for updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function getRiskDescription(riskLevel: string): string {
  switch (riskLevel) {
    case 'high':
      return 'Your area is currently experiencing significant seismic activity. This indicates an elevated risk of earthquakes and potential aftershocks.';
    case 'medium':
      return 'There is moderate seismic activity in your area. While not severe, its important to stay informed and prepared.';
    case 'low':
      return 'Seismic activity in your area is currently at normal levels. Continue to monitor for any changes.';
    default:
      return 'Unable to determine current risk level. Please check back later.';
  }
}

function getRiskRecommendations(riskLevel: string): string[] {
  const baseRecommendations = [
    'Keep emergency supplies readily available',
    'Know your evacuation routes',
    'Stay informed through local news and alerts'
  ];

  switch (riskLevel) {
    case 'high':
      return [
        'Be prepared for potential strong aftershocks',
        'Review your earthquake safety plan with family/household',
        'Secure loose items that could fall during shaking',
        ...baseRecommendations
      ];
    case 'medium':
      return [
        'Review your earthquake safety plan',
        'Check emergency supply kit completeness',
        ...baseRecommendations
      ];
    case 'low':
      return [
        'Use this time to prepare your emergency kit',
        'Review and update your safety plan',
        ...baseRecommendations
      ];
    default:
      return baseRecommendations;
  }
}
