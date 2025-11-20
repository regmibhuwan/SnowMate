import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LogSituation } from './pages/LogSituation';
import { Insights } from './pages/Insights';
import { Journal } from './pages/Journal';
import { Settings } from './pages/Settings';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/log" element={<LogSituation />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;