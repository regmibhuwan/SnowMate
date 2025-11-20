import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { clearLogs } from '../services/storageService';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
    const { refreshLogs } = useApp();

    const handleClearData = () => {
        if(window.confirm("Are you sure you want to delete all your logs? This cannot be undone.")) {
            clearLogs();
            refreshLogs();
            alert("Data cleared.");
        }
    }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      </header>

      <Card title="Data Management">
        <p className="text-sm text-slate-500 mb-4">All data is stored locally in your browser.</p>
        <Button variant="danger" onClick={handleClearData}>
            Clear All Data
        </Button>
      </Card>

      <Card title="About CalmLens">
        <p className="text-sm text-slate-600 leading-relaxed">
            CalmLens uses AI to help reframe social anxiety thoughts using Cognitive Behavioral Therapy (CBT) principles. 
            It is not a replacement for professional therapy.
        </p>
        <div className="mt-4 text-xs text-slate-400">
            Version 1.0.0
        </div>
      </Card>
    </div>
  );
};