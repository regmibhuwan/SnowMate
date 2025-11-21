'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ChatUI from '@/components/ChatUI';
import MiniForecastBar from '@/components/MiniForecastBar';

export default function ChatPage() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Med' | 'High'>('Low');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
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
            fetchWithLocation(lat, lon);
          }
        );
      } else {
        fetchWithLocation(lat, lon);
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setLoading(false);
    }
  };

  const fetchWithLocation = async (lat: string, lon: string) => {
    try {
      const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Weather fetch failed');
      }
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // Get risk level from summary
      try {
        const summaryResponse = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(weather),
        });
        if (summaryResponse.ok) {
          const summary = await summaryResponse.json();
          const maxRisk = Math.max(
            summary.riskScores?.road || 0,
            summary.riskScores?.cold || 0,
            summary.riskScores?.slip || 0
          );
          if (maxRisk === 0) setRiskLevel('Low');
          else if (maxRisk === 1) setRiskLevel('Med');
          else setRiskLevel('High');
        }
      } catch (summaryErr) {
        console.error('Failed to fetch summary:', summaryErr);
        // Continue without summary, use default risk
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentTemp = weatherData?.current?.main?.temp || 0;
  const currentCondition = weatherData?.current?.weather?.[0]?.main || 'Clear';

  return (
    <main className="min-h-screen flex flex-col mobile-container">
      {/* Header */}
      <div className="flex items-center gap-3 pt-6 pb-2 px-4">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Ask SnowMate</h1>
      </div>

      {/* Mini Forecast Bar */}
      {!loading && (
        <MiniForecastBar
          temperature={currentTemp}
          condition={currentCondition}
          riskLevel={riskLevel}
        />
      )}

      {/* Chat UI */}
      <div className="flex-1 min-h-0">
        <ChatUI weatherContext={weatherData} />
      </div>
    </main>
  );
}

