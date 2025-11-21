'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import WeatherCard from '@/components/WeatherCard';
import RiskBar from '@/components/RiskBar';
import WeekCarousel from '@/components/WeekCarousel';

interface WeatherSummary {
  dailySummary: string;
  clothingAdvice: string;
  safetyNotes: string;
  whatToExpect: string[];
  riskScores: {
    road: number;
    cold: number;
    slip: number;
  };
  weeklyMoods: Array<{
    day: string;
    mood: string;
  }>;
}

export default function Home() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [summary, setSummary] = useState<WeatherSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location (default to Toronto)
      let lat = '43.6532';
      let lon = '-79.3832';

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            lat = position.coords.latitude.toString();
            lon = position.coords.longitude.toString();
            fetchWithLocation(lat, lon);
          },
          () => {
            // Fallback to default location if geolocation fails
            fetchWithLocation(lat, lon);
          }
        );
      } else {
        fetchWithLocation(lat, lon);
      }
    } catch (err) {
      setError('Failed to load weather data');
      setLoading(false);
    }
  };

  const fetchWithLocation = async (lat: string, lon: string) => {
    try {
      // Fetch weather data
      const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!weatherResponse.ok) throw new Error('Weather fetch failed');
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // Fetch summary
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weather),
      });
      if (!summaryResponse.ok) throw new Error('Summary fetch failed');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskClick = (riskType: 'road' | 'cold' | 'slip') => {
    // Could show a modal or navigate to details
    console.log(`Clicked ${riskType} risk`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mobile-container">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center mobile-container">
        <div className="text-center glass-strong rounded-3xl p-8">
          <p className="text-gray-700 text-lg mb-4">{error || 'Failed to load data'}</p>
          <button
            onClick={fetchWeatherData}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-semibold transition-colors shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentTemp = weatherData?.current?.main?.temp;
  const currentCondition = weatherData?.current?.weather?.[0]?.main || 'Clear';

  return (
    <main className="min-h-screen pb-6 mobile-container">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-800">SnowMate</h1>
        <button
          onClick={() => router.push('/chat')}
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Weather Card */}
      <div className="animate-fade-in">
        <WeatherCard
          summary={{
            ...summary,
            temperature: currentTemp,
            condition: currentCondition,
          }}
        />
      </div>

      {/* Risk Bar */}
      <RiskBar risks={summary.riskScores} onRiskClick={handleRiskClick} />

      {/* Weekly Carousel */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 px-2">
          This Week
        </h2>
        <WeekCarousel 
          weeklyMoods={summary.weeklyMoods.map((mood, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            return {
              ...mood,
              date: `${dayName} ${dayNum}`,
            };
          })} 
        />
      </div>
    </main>
  );
}
