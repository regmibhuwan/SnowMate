'use client';

import { Car, Thermometer, AlertTriangle } from 'lucide-react';

interface RiskBarProps {
  risks: {
    road: number;
    cold: number;
    slip: number;
  };
  onRiskClick?: (riskType: 'road' | 'cold' | 'slip') => void;
}

const riskLabels = {
  road: 'Road Risk',
  cold: 'Cold Risk',
  slip: 'Slip Risk',
};

const riskIcons = {
  road: Car,
  cold: Thermometer,
  slip: AlertTriangle,
};

const getRiskColor = (level: number) => {
  if (level === 0) return 'bg-green-500/80 border-green-400';
  if (level === 1) return 'bg-yellow-500/80 border-yellow-400';
  return 'bg-red-500/80 border-red-400';
};

const getRiskLabel = (level: number) => {
  if (level === 0) return 'Low';
  if (level === 1) return 'Med';
  return 'High';
};

export default function RiskBar({ risks, onRiskClick }: RiskBarProps) {
  return (
    <div className="flex justify-center gap-4 mb-6 px-2">
      {(Object.keys(risks) as Array<keyof typeof risks>).map((riskType) => {
        const Icon = riskIcons[riskType];
        const level = risks[riskType];
        const colorClass = getRiskColor(level);
        const label = getRiskLabel(level);

        return (
          <button
            key={riskType}
            onClick={() => onRiskClick?.(riskType)}
            className="flex flex-col items-center gap-2 active:scale-95 transition-all duration-200 hover:scale-105"
          >
            <div
              className={`w-16 h-16 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-lg backdrop-blur-sm`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {riskLabels[riskType]}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

