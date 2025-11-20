import React, { createContext, useContext, useState, useEffect } from 'react';
import { SituationLog } from '../types';
import { getLogs, saveLog } from '../services/storageService';

interface AppContextType {
  logs: SituationLog[];
  addLog: (log: SituationLog) => void;
  refreshLogs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<SituationLog[]>([]);

  const refreshLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const addLog = (log: SituationLog) => {
    saveLog(log);
    refreshLogs();
  };

  return (
    <AppContext.Provider value={{ logs, addLog, refreshLogs }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};