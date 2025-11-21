'use client';

import { Snowflake, Droplets, Cloud, Sun } from 'lucide-react';

interface MiniForecastBarProps {
  temperature: number;
  condition: string;
  riskLevel: 'Low' | 'Med' | 'High';
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes('snow')) return <Snowflake className="w-4 h-4" />;
  if (lower.includes('rain') || lower.includes('drizzle')) return <Droplets className="w-4 h-4" />;
  if (lower.includes('cloud')) return <Cloud className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
};

const getRiskColor = (risk: string) => {
  if (risk === 'Low') return 'text-green-600';
  if (risk === 'Med') return 'text-yellow-600';
  return 'text-red-600';
};

export default function MiniForecastBar({
  temperature,
  condition,
  riskLevel,
}: MiniForecastBarProps) {
  return (
    <div className="sticky top-0 z-10 glass-strong border-b border-gray-200 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-gray-700">
          {getWeatherIcon(condition)}
          <span className="text-lg font-semibold text-gray-800">
            {Math.round(temperature)}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Risk:</span>
          <span className={`text-sm font-semibold ${getRiskColor(riskLevel)}`}>
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

