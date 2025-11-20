import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSituation } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { AnalysisResult, LoadingState, SituationLog } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle2, Sparkles, Frown, Meh, Smile, Heart } from 'lucide-react';

export const LogSituation: React.FC = () => {
  const navigate = useNavigate();
  const { addLog } = useApp();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    
    setStatus(LoadingState.LOADING);
    setError(null);
    
    try {
      const analysis = await analyzeSituation(description, rating);
      setResult(analysis);
      setStep(2);
      setStatus(LoadingState.SUCCESS);
      
      // Save to history immediately
      const newLog: SituationLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description,
        userSelfRating: rating,
        analysis
      };
      addLog(newLog);
      
    } catch (err) {
      console.error(err);
      setError("Unable to analyze at this moment. Please check your connection or API key.");
      setStatus(LoadingState.ERROR);
    }
  };

  const getEmojiForRating = (r: number) => {
      if (r <= 3) return <Smile className="w-8 h-8 text-emerald-500" />;
      if (r <= 7) return <Meh className="w-8 h-8 text-amber-500" />;
      return <Frown className="w-8 h-8 text-rose-500" />;
  };

  return (
    <div className="pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 ? "What's on your mind?" : "Perspective Shift"}
        </h1>
        <p className="text-slate-500">
            {step === 1 ? "Describe the situation honestly. No judgment here." : "Here is a grounded way to look at it."}
        </p>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
                <textarea
                    className="w-full h-40 p-0 border-0 focus:ring-0 resize-none text-lg text-slate-700 placeholder:text-slate-300 leading-relaxed"
                    placeholder="I felt anxious when..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Card>

            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-600 flex justify-between">
                    <span>Anxiety Level</span>
                    <span className="font-bold text-indigo-600">{rating}/10</span>
                </label>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                    {getEmojiForRating(rating)}
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between w-full text-xs text-slate-400 uppercase font-bold tracking-wider">
                        <span>Calm</span>
                        <span>Panic</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <Button 
                className="w-full py-4 text-lg shadow-indigo-200 shadow-lg" 
                onClick={handleAnalyze}
                disabled={!description || status === LoadingState.LOADING}
                isLoading={status === LoadingState.LOADING}
                icon={<Sparkles size={20} />}
            >
                {status === LoadingState.LOADING ? "Analyzing..." : "Analyze Situation"}
            </Button>
          </motion.div>
        )}

        {step === 2 && result && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* The Normal Perspective Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={100} className="text-indigo-600" />
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Normal Perspective</span>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Baseline Behavior</h3>
                        <p className="text-slate-800 text-lg leading-relaxed">{result.normalPerspective.baselineBehavior}</p>
                    </div>

                    <div className="w-full h-px bg-indigo-100 my-2"></div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Alternative View</h3>
                        <p className="text-slate-700">{result.normalPerspective.alternativeInterpretation}</p>
                    </div>
                </div>
            </Card>

            {/* Supportive Message */}
            <Card className="bg-emerald-50 border-emerald-100">
                <div className="flex gap-4 items-start">
                    <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500 mt-1">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-900 mb-1">Remember</h3>
                        <p className="text-emerald-800 leading-relaxed text-sm">{result.normalPerspective.supportiveMessage}</p>
                    </div>
                </div>
            </Card>

            {/* Extracted Tags */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 ml-1">Pattern Detected</h3>
                <div className="flex flex-wrap gap-2">
                    {result.triggers.map((t, i) => (
                        <span key={`t-${i}`} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-sm">
                           Trigger: {t}
                        </span>
                    ))}
                    {result.thoughts.map((t, i) => (
                        <span key={`th-${i}`} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-sm">
                           Thought: {t}
                        </span>
                    ))}
                     {result.symptoms.map((t, i) => (
                        <span key={`s-${i}`} className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-full text-sm">
                           Symptom: {t}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => navigate('/')}>
                    Home
                </Button>
                <Button className="flex-1" onClick={() => {
                    setStep(1);
                    setDescription('');
                    setRating(5);
                    setResult(null);
                }}>
                    Log Another
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};