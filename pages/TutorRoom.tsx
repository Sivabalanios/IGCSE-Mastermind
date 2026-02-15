
import React, { useState, useRef } from 'react';
import { Subject, FeedbackResponse, TeacherExplanation } from '../types';
import { gradeAnswer, explainConcept } from '../services/geminiService';

const TutorRoom: React.FC = () => {
  const [mode, setMode] = useState<'grade' | 'teach'>('grade');
  const [subject, setSubject] = useState<Subject>('Biology (0610)');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [explanation, setExplanation] = useState<TeacherExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects: Subject[] = [
    'Biology (0610)', 
    'Chemistry (0620)', 
    'Physics (0625)', 
    'Combined Science (0653)', 
    'Mathematics (0580)', 
    'Additional Mathematics (0606)', 
    'Economics (0455)', 
    'English (0500)'
  ];

  const handleGrade = async () => {
    setError(null);
    if (!question && !image) { setError('Please provide a CAIE exam question.'); return; }
    if (!answer) { setError('Please provide your answer.'); return; }
    setLoading(true); setFeedback(null);
    try {
      const result = await gradeAnswer(subject, question, answer, image || undefined);
      setFeedback(result);
      const saved = JSON.parse(localStorage.getItem('igcse_attempts') || '[]');
      saved.push({ id: Date.now().toString(), subject, score: result.attainedMarks, maxScore: result.totalMarks, timestamp: Date.now() });
      localStorage.setItem('igcse_attempts', JSON.stringify(saved));
    } catch (err) { setError('Grading failed. Ensure your answer follows CAIE standards.'); } finally { setLoading(false); }
  };

  const handleTeach = async () => {
    setError(null);
    if (!topic) { setError('What CAIE topic should I teach you?'); return; }
    setLoading(true); setExplanation(null);
    try {
      const result = await explainConcept(subject, topic);
      setExplanation(result);
    } catch (err) { setError('Teacher is unavailable. Try again.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex">
        <button 
          onClick={() => {setMode('grade'); setExplanation(null); setFeedback(null); setError(null);}}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'grade' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          CAIE Examiner
        </button>
        <button 
          onClick={() => {setMode('teach'); setExplanation(null); setFeedback(null); setError(null);}}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'teach' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Cambridge Tutor
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
        
        <div className="flex flex-wrap gap-2 mb-8">
          {subjects.map((s) => (
            <button key={s} onClick={() => setSubject(s)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${subject === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>

        {mode === 'grade' ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-2">
              <p className="text-xs font-bold text-indigo-700">Paste your CAIE past paper question and your attempt below. We use strict Cambridge marking schemes.</p>
            </div>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="CAIE Question (e.g., Define the term homeostasis...)" className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your Response..." className="w-full h-48 p-4 rounded-2xl border border-slate-200 font-mono text-sm" />
            <button onClick={handleGrade} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50">
              {loading ? 'Consulting CAIE Marking Schemes...' : 'Submit to Cambridge AI Grader'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cambridge Syllabus Master</h2>
            <div className="relative">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Electromagnetism, Electrolysis, Differentiation..." className="w-full p-6 pr-32 rounded-3xl border-2 border-slate-100 focus:border-indigo-500 transition-all outline-none text-xl font-bold" />
              <button onClick={handleTeach} disabled={loading} className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-6 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Fetching CAIE Data...' : 'Master Topic'}
              </button>
            </div>
            <p className="text-sm text-slate-400 font-medium italic">Strictly following the CAIE Assessment Objectives (AO1, AO2, AO3).</p>
          </div>
        )}
      </div>

      {explanation && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl animate-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-2xl font-black text-indigo-900">{explanation.concept}</h3>
             <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-200">CAIE Ref: {explanation.syllabusReference}</span>
          </div>
          <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed space-y-4 font-medium">
            {explanation.explanation?.split('\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
               <h4 className="text-amber-800 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Cambridge Technical Keywords</h4>
               <div className="flex flex-wrap gap-2">
                 {explanation.keyKeywords?.map((k, i) => <span key={i} className="bg-white px-3 py-1 rounded-lg border border-amber-300 text-amber-700 text-sm font-bold shadow-sm">{k}</span>)}
               </div>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200">
               <h4 className="text-indigo-800 font-black uppercase text-[10px] tracking-[0.2em] mb-4">CAIE Exam Strategy</h4>
               <p className="text-sm text-indigo-700 leading-relaxed font-bold italic">{explanation.furtherReading}</p>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner animate-in fade-in">
           <div className="flex justify-between items-end mb-8">
              <div>
                 <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">CAIE IGCSE GRADE</p>
                 <h3 className="text-7xl font-black text-indigo-600">{feedback.predictedGrade || 'B'}</h3>
              </div>
              <div className="text-right">
                 <p className="text-5xl font-black text-slate-800 tracking-tighter">{feedback.attainedMarks}/{feedback.totalMarks}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marking Outcome</p>
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <h4 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest">Cambridge Point Logic</h4>
                 <div className="space-y-3">
                   {feedback.marksBreakdown?.map((item, i) => (
                     <div key={i} className="p-3 bg-slate-50 rounded-lg flex justify-between items-start border-l-4 border-slate-200">
                       <div className="flex-1 pr-4">
                         <p className={`text-sm font-bold ${item.awarded ? 'text-green-700' : 'text-red-500'}`}>{item.point}</p>
                         <p className="text-[11px] text-slate-500 mt-1 font-medium">{item.reason}</p>
                       </div>
                       <span className={`text-sm font-black ${item.awarded ? 'text-green-600' : 'text-slate-300'}`}>{item.awarded ? '+1' : '0'}</span>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="space-y-6">
                <div className="bg-indigo-900 text-white p-6 rounded-2xl border-b-4 border-indigo-700">
                   <h4 className="font-black text-indigo-300 text-[10px] uppercase tracking-widest mb-2">Examiner's Verdict (CAIE Style)</h4>
                   <p className="italic text-sm leading-relaxed font-bold">"{feedback.teacherComments}"</p>
                </div>
                <div className="bg-slate-800 text-slate-300 p-6 rounded-2xl font-mono text-[11px] shadow-xl">
                   <h4 className="text-slate-500 uppercase font-black mb-4 tracking-widest">Standard CAIE Model Answer</h4>
                   <div className="whitespace-pre-wrap leading-relaxed">{feedback.modelAnswer}</div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TutorRoom;
