import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';

export const Insights: React.FC = () => {
  const { logs } = useApp();

  // 1. Trigger Frequency
  const triggerMap: Record<string, number> = {};
  logs.forEach(log => {
    log.analysis?.triggers.forEach(t => {
        // Normalize simple string
        const key = t.toLowerCase().trim();
        triggerMap[key] = (triggerMap[key] || 0) + 1;
    });
  });
  const triggerData = Object.entries(triggerMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 2. Anxiety over time (last 7 entries)
  const trendData = logs
    .slice(0, 7)
    .reverse()
    .map((log, idx) => ({
        name: `Log ${idx + 1}`,
        anxiety: log.userSelfRating,
        date: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})
    }));

  // 3. Symptom Distribution
  const symptomMap: Record<string, number> = {};
  logs.forEach(log => {
    log.analysis?.symptoms.forEach(s => {
        const key = s.toLowerCase().trim();
        symptomMap[key] = (symptomMap[key] || 0) + 1;
    });
  });
  const symptomData = Object.entries(symptomMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  if (logs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
                <BarChart className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700">No data yet</h2>
            <p className="text-slate-500 max-w-xs mt-2">Log a few situations to unlock personalized insights and pattern detection.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
        <p className="text-slate-500">Understanding your patterns.</p>
      </header>

      {/* Trend Chart */}
      <Card title="Anxiety Trend" subtitle="Last 7 logs">
        <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                    <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="anxiety" radius={[4, 4, 0, 0]}>
                        {trendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.anxiety > 7 ? '#f43f5e' : entry.anxiety > 4 ? '#f59e0b' : '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Triggers */}
      <Card title="Common Triggers" subtitle="What sets it off most often">
        <div className="space-y-4 mt-2">
            {triggerData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex-1">
                        <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${(item.value / logs.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 min-w-[80px] truncate">{item.name}</span>
                </div>
            ))}
        </div>
      </Card>

      {/* Symptom Pie (Simple list for cleaner mobile UI than pie sometimes) */}
      <Card title="Body Reactions" subtitle="Physical manifestations">
         <div className="flex flex-wrap gap-3 mt-2">
            {symptomData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-400">({item.value})</span>
                </div>
            ))}
         </div>
      </Card>
    </div>
  );
};