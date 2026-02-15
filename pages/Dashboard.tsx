
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExamAttempt, StudentAnalysis } from '../types';
import { analyzeStudentPerformance } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [analysis, setAnalysis] = useState<StudentAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('igcse_attempts');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAttempts(parsed);
      loadAnalysis(parsed);
    }
  }, []);

  const loadAnalysis = async (history: ExamAttempt[]) => {
    if (history.length === 0) return;
    setLoadingAnalysis(true);
    try {
      const data = await analyzeStudentPerformance(history);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const chartData = attempts.map(a => ({
    name: new Date(a.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    score: Math.round((a.score / a.maxScore) * 100),
    subject: a.subject
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Teacher's Briefing</h2>
            {loadingAnalysis ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-indigo-800 rounded w-3/4"></div>
                <div className="h-4 bg-indigo-800 rounded w-1/2"></div>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <p className="text-indigo-100 leading-relaxed italic border-l-2 border-indigo-400 pl-4">
                  "{analysis.personalizedAdvice}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.weaknesses?.map((w, idx) => (
                    <span key={idx} className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                      Needs Focus: {w}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-indigo-200">Start learning to get personalized exam advice!</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
             {analysis?.predictedGrades && Object.entries(analysis.predictedGrades || {}).slice(0, 4).map(([subj, grade]) => (
               <div key={subj} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                 <p className="text-xs text-indigo-300 font-bold uppercase">{subj}</p>
                 <p className="text-2xl font-black text-white">{grade}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Mastery Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Recent Work
          </h3>
          <div className="space-y-3">
            {attempts.slice(-4).reverse().map((attempt) => (
              <div key={attempt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">{attempt.subject}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <span className="text-indigo-600 font-black">{Math.round((attempt.score/attempt.maxScore)*100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
