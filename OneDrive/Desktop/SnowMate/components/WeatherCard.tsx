'use client';

import { Cloud, Snowflake, Droplets, Wind, Sun } from 'lucide-react';

interface WeatherCardProps {
  summary: {
    dailySummary?: string;
    clothingAdvice?: string;
    safetyNotes?: string;
    whatToExpect?: string[];
    temperature?: number;
    condition?: string;
  };
}

const getWeatherIcon = (condition: string = '') => {
  const lower = condition.toLowerCase();
  if (lower.includes('snow')) return <Snowflake className="w-8 h-8" />;
  if (lower.includes('rain') || lower.includes('drizzle')) return <Droplets className="w-8 h-8" />;
  if (lower.includes('cloud')) return <Cloud className="w-8 h-8" />;
  if (lower.includes('wind')) return <Wind className="w-8 h-8" />;
  return <Sun className="w-8 h-8" />;
};

export default function WeatherCard({ summary }: WeatherCardProps) {
  return (
    <div className="glass-strong rounded-3xl p-6 mb-6 shadow-xl animate-fade-in hover:shadow-2xl transition-all duration-300">
      {/* Main Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {getWeatherIcon(summary.condition)}
          {summary.temperature !== undefined && (
            <span className="text-5xl font-bold text-gray-800">
              {Math.round(summary.temperature)}°
            </span>
          )}
        </div>
        <p className="text-xl text-gray-700 leading-relaxed font-medium">
          {summary.dailySummary || 'Loading weather summary...'}
        </p>
      </div>

      {/* Clothing Advice */}
      {summary.clothingAdvice && (
        <div className="mb-5 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            What to Wear
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            {summary.clothingAdvice}
          </p>
        </div>
      )}

      {/* What to Expect */}
      {summary.whatToExpect && summary.whatToExpect.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            What to Expect Today
          </h3>
          <ul className="space-y-2">
            {summary.whatToExpect.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Notes */}
      {summary.safetyNotes && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic leading-relaxed">
            {summary.safetyNotes}
          </p>
        </div>
      )}
    </div>
  );
}

