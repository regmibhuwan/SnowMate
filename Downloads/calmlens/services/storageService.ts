import { SituationLog } from "../types";

const STORAGE_KEY = 'calmlens_logs_v1';

export const getLogs = (): SituationLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse logs", e);
    return [];
  }
};

export const saveLog = (log: SituationLog): void => {
  const logs = getLogs();
  const updatedLogs = [log, ...logs]; // Prepend new log
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
};

export const clearLogs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Helper for insights
export const getMockDataIfEmpty = () => {
  const logs = getLogs();
  if (logs.length === 0) {
    // Seed some data if empty for demo purposes
    return; 
  }
};