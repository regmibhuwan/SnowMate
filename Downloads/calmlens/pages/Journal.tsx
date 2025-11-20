import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Trash2 } from 'lucide-react';

export const Journal: React.FC = () => {
  const { logs } = useApp();

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Journal</h1>
        <p className="text-slate-500">Your history of growth.</p>
      </header>

      <div className="space-y-4">
        {logs.map((log, index) => (
            <Card key={log.id} delay={index * 0.05} className="group">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Anxiety: {log.userSelfRating}/10</span>
                    </div>
                </div>
                <p className="text-slate-700 mb-4">{log.description}</p>
                
                {log.analysis && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Normal Perspective</p>
                        <p className="text-sm text-slate-600 italic">"{log.analysis.normalPerspective.alternativeInterpretation}"</p>
                    </div>
                )}
            </Card>
        ))}
        {logs.length === 0 && (
            <div className="text-center text-slate-400 py-10">
                No entries yet. Start by logging a situation!
            </div>
        )}
      </div>
    </div>
  );
};