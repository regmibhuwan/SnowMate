import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Activity, TrendingDown, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { logs } = useApp();
  
  const recentLogs = logs.slice(0, 3);
  
  // Quick stats
  const totalLogs = logs.length;
  const avgAnxiety = totalLogs > 0 
    ? (logs.reduce((acc, curr) => acc + curr.userSelfRating, 0) / totalLogs).toFixed(1) 
    : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{greeting()}, Friend.</h1>
          <p className="text-slate-500">Ready to find your calm today?</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/log" className="col-span-2">
          <motion.div 
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 cursor-pointer flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-lg">Log a Situation</h3>
              <p className="text-indigo-100 text-sm opacity-90">Analyze feelings & get perspective</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-100" delay={0.1}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Activity size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Entries</span>
            </div>
            <span className="text-3xl font-bold text-slate-800">{totalLogs}</span>
          </div>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-100" delay={0.2}>
           <div className="flex flex-col">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <TrendingDown size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Avg Anxiety</span>
            </div>
            <span className="text-3xl font-bold text-slate-800">{avgAnxiety}<span className="text-sm text-slate-400 font-normal">/10</span></span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Journal</h2>
            <Link to="/journal" className="text-sm text-indigo-600 font-medium hover:underline">View all</Link>
        </div>
        
        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <Card className="py-8 flex flex-col items-center text-center border-dashed">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <Calendar className="text-slate-400 w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium">No entries yet</p>
              <p className="text-slate-400 text-sm mb-4">Your journey begins with the first step.</p>
            </Card>
          ) : (
            recentLogs.map((log) => (
              <Link to={`/journal`} key={log.id}>
                  <Card className="mb-3 hover:border-indigo-200 transition-colors group">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium mb-1">
                                {new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-slate-800 font-medium line-clamp-2">{log.description}</p>
                        </div>
                        <div className={`ml-4 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            log.userSelfRating > 7 ? 'bg-rose-100 text-rose-700' :
                            log.userSelfRating > 4 ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {log.userSelfRating}/10
                        </div>
                    </div>
                    {log.analysis?.symptoms.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {log.analysis.symptoms.slice(0, 2).map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md uppercase tracking-wide">
                                    {s}
                                </span>
                            ))}
                            {log.analysis.symptoms.length > 2 && (
                                <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] rounded-md">
                                    +{log.analysis.symptoms.length - 2}
                                </span>
                            )}
                        </div>
                    ) : null}
                  </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};