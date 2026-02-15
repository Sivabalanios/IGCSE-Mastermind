
import React, { useState } from 'react';
import { Subject, StudyGuideData } from '../types';
import { fetchStudyGuide } from '../services/geminiService';

const StudyHub: React.FC = () => {
  const [subject, setSubject] = useState<Subject>('Mathematics (0580)');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<StudyGuideData | null>(null);

  const subjects: Subject[] = [
    'Mathematics (0580)', 
    'Additional Mathematics (0606)', 
    'Physics (0625)', 
    'Chemistry (0620)', 
    'Biology (0610)', 
    'Combined Science (0653)', 
    'Economics (0455)'
  ];

  const handleFetch = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await fetchStudyGuide(subject, topic);
      setGuide(data);
    } catch (err) {
      alert("Failed to load study hub content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Master Any Topic</h2>
        <p className="text-slate-600 font-medium max-w-2xl mx-auto">Input a topic to receive a custom-built revision guide with subtopics, formulas, and worked examples.</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                subject === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Circular Measure, Stoichiometry, Momentum..."
            className="w-full p-6 pr-40 rounded-3xl border-4 border-slate-50 focus:border-indigo-100 transition-all outline-none text-xl font-bold text-slate-900 shadow-inner bg-slate-50/50"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Synthesizing...' : 'Master Topic'}
          </button>
        </div>
      </div>

      {guide && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
          {/* Summary & Subtopics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{guide.topic}</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">{guide.summary}</p>
              <div className="flex flex-wrap gap-2 pt-4">
                {guide.subtopics?.map((s, i) => (
                  <span key={i} className="bg-slate-100 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase border border-slate-200">{s}</span>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 bg-amber-50 p-8 rounded-[3rem] border border-amber-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs mb-6">Examiner Must-Knows</h4>
                <ul className="space-y-4">
                  {guide.mustKnows?.map((m, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm font-bold text-amber-800/80">
                      <div className="w-5 h-5 bg-amber-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Formulas - High Contrast Visibility */}
          {(guide.formulas?.length || 0) > 0 && (
            <div className="space-y-6">
              <h4 className="text-xl font-black text-slate-900 px-4">Formula Vault</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guide.formulas?.map((f, i) => (
                  <div key={i} className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl border-b-4 border-indigo-700 transition-transform hover:-translate-y-1">
                    <p className="text-indigo-300 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">{f.name}</p>
                    <p className="text-2xl font-black text-white mb-4 font-mono">{f.formula}</p>
                    <p className="text-indigo-200/60 text-[11px] leading-relaxed font-bold italic">{f.application}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worked Examples - Practical Application */}
          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-900 px-4">Worked Examples</h4>
            <div className="space-y-8">
              {guide.workedExamples?.map((ex, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <span className="text-slate-100 font-black text-7xl select-none">#{i + 1}</span>
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <h5 className="font-black text-indigo-600 text-sm uppercase tracking-widest">{ex.title}</h5>
                      <p className="text-2xl font-black text-slate-900 max-w-3xl leading-snug">{ex.question}</p>
                    </div>

                    <div className="space-y-6 border-l-4 border-slate-100 pl-8 ml-2">
                      {ex.steps?.map((step, si) => (
                        <div key={si} className="space-y-2">
                          <p className="text-sm font-bold text-slate-500">Step {si + 1}: {step.description}</p>
                          {step.working && (
                            <div className="bg-slate-50 p-4 rounded-2xl font-mono text-indigo-700 font-bold shadow-inner">
                              {step.working}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-green-50 p-6 rounded-[2rem] border-2 border-green-100 inline-block">
                      <p className="text-xs font-black text-green-700 uppercase mb-1">Final Verified Answer</p>
                      <p className="text-3xl font-black text-green-800 font-mono tracking-tight">{ex.finalAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyHub;
