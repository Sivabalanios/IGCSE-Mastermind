
import React, { useState, useEffect } from 'react';
import { Subject, MockQuestion, MockExamResult } from '../types';
import { generateMockPaper, gradeMockExam } from '../services/geminiService';

const MockExam: React.FC = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState<'theory' | 'mcq'>('mcq');
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins default for MCQ
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MockExamResult | null>(null);

  const subjects: { name: Subject; icon: string; color: string }[] = [
    { name: 'Biology (0610)', icon: '🌱', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Chemistry (0620)', icon: '🧪', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Physics (0625)', icon: '⚡', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Mathematics (0580)', icon: '📐', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Additional Mathematics (0606)', icon: '📈', color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { name: 'Combined Science (0653)', icon: '🔬', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { name: 'Economics (0455)', icon: '📊', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'English (0500)', icon: '📚', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  useEffect(() => {
    let timer: any;
    if (examStarted && timeLeft > 0 && !submitted) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = async () => {
    if (!subject) {
        alert("Please select a subject first.");
        return;
    }
    setLoading(true);
    try {
      const qs = await generateMockPaper(subject, topic, examType);
      if (!qs || qs.length === 0) throw new Error("No questions generated");
      
      setQuestions(qs);
      setExamStarted(true);
      setSubmitted(false);
      setResult(null);
      setCurrentIdx(0);
      setAnswers({});
      setTimeLeft(examType === 'mcq' ? 600 : 1800); 
    } catch (err) {
      alert("Failed to fetch CAIE exam paper. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject) return;
    setSubmitted(true);
    setGrading(true);
    try {
      const gradeReport = await gradeMockExam(subject, questions, answers);
      setResult(gradeReport);
      
      const saved = JSON.parse(localStorage.getItem('igcse_attempts') || '[]');
      saved.push({
        id: Date.now().toString(),
        subject,
        score: gradeReport.attainedMarks,
        maxScore: gradeReport.totalMarks,
        timestamp: Date.now(),
        topic
      });
      localStorage.setItem('igcse_attempts', JSON.stringify(saved));
    } catch (err) {
      console.error(err);
      alert("Grading failed. Please check connection.");
    } finally {
      setGrading(false);
    }
  };

  // 1. RESULTS VIEW
  if (result) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-10 animate-in fade-in duration-700">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-8 text-center">
          <div className="inline-block p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 mb-4">
             <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">CAIE IGCSE GRADE</p>
             <h3 className="text-7xl font-black text-indigo-600">{result.grade}</h3>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Cambridge Performance Card</h2>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
             <div className="bg-slate-50 p-6 rounded-2xl">
                <p className="text-2xl font-black text-slate-900">{result.attainedMarks}/{result.totalMarks}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl">
                <p className="text-2xl font-black text-slate-900">{result.percentage}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Percentage</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl">
                <p className="text-2xl font-black text-green-600">{Math.round((result.percentage || 0)/11.1)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cambridge Scale</p>
             </div>
          </div>
          <div className="bg-slate-950 text-white p-8 rounded-3xl text-left italic relative overflow-hidden border-b-4 border-indigo-600">
             <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-5xl">REPORT</div>
             <p className="relative z-10 text-lg leading-relaxed font-medium">"{result.overallTeacherComments}"</p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black text-slate-900 px-4">Cambridge Question Breakdown</h4>
          {result.feedbackPerQuestion?.map((item, i) => (
            <div key={i} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${item.correct ? 'border-green-100' : 'border-red-50'}`}>
              <div className="flex justify-between items-start mb-6">
                <span className="text-slate-400 font-black text-3xl">#0{i+1}</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.correct ? 'Verified Solution' : 'Cambridge Point Lost'}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 mb-6 leading-tight">
                {questions?.find(q => q.id === item.questionId)?.text}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Candidate Entry</p>
                  <p className="font-bold text-slate-700">{item.studentAnswer}</p>
                </div>
                {!item.correct && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-black text-green-400 uppercase mb-1 tracking-widest">Examiner Solution</p>
                    <p className="font-bold text-green-700">{item.correctAnswer}</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed font-medium border-l-4 border-indigo-400">
                <p className="font-black text-slate-900 mb-2 uppercase text-[10px] tracking-widest">Cambridge Technical Explanation</p>
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={() => { setExamStarted(false); setResult(null); }} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-xl mb-20">
          Return to Hub
        </button>
      </div>
    );
  }

  // 2. SETUP VIEW
  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">CAIE Mock Exam Center</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Simulating Cambridge Assessment International Education Standards</p>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl space-y-12">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">1. Select Cambridge Syllabus</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSubject(s.name)}
                  className={`p-6 rounded-3xl border-4 transition-all text-center flex flex-col items-center space-y-3 ${
                    subject === s.name 
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 scale-105' 
                    : 'border-transparent bg-slate-50 hover:bg-white hover:border-slate-100'
                  }`}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 leading-none">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">2. Exam Component</h3>
              <div className="flex space-x-2 bg-slate-100 p-2 rounded-2xl">
                <button 
                  onClick={() => setExamType('mcq')}
                  className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${examType === 'mcq' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                >
                  Paper 2 (MCQ)
                </button>
                <button 
                  onClick={() => setExamType('theory')}
                  className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${examType === 'theory' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                >
                  Paper 4 (Theory)
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">3. Target Topic <span className="text-slate-300 font-medium">(Optional)</span></h3>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Circular Motion, Genetics..."
                className="w-full p-4 rounded-2xl bg-slate-100 border-none focus:ring-4 focus:ring-indigo-100 text-lg font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={loading || !subject}
            className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 group overflow-hidden relative"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Assembling CAIE Paper...</span>
              </span>
            ) : (
              <span>Start Digital Exam</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 3. EXAM IN PROGRESS VIEW
  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-6">
      <div className="bg-slate-950 text-white p-6 rounded-[2.5rem] flex items-center justify-between sticky top-4 z-50 shadow-2xl border border-white/5">
        <div className="flex items-center space-x-8">
          <div className={`px-6 py-3 rounded-2xl font-black text-2xl tabular-nums shadow-lg ${timeLeft < 60 ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">CAIE EVALUATION: {currentIdx + 1}/10</p>
            <p className="font-bold text-lg leading-tight truncate max-w-[200px]">{topic || 'General Syllabus'}</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={grading || questions.length === 0}
          className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {grading ? 'Marking...' : 'Final Submission'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        <div className="lg:col-span-8 space-y-8">
          {currentQ && (
            <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden text-slate-900 animate-in slide-in-from-right-10 duration-500">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              
              <div className="space-y-12">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-black text-7xl opacity-5 select-none">#{currentIdx + 1}</span>
                  <div className="flex space-x-2">
                    {questions?.map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIdx ? 'bg-indigo-600 scale-125' : answers[questions[i].id] ? 'bg-green-400' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                </div>

                <div className="space-y-10">
                  <p className="text-3xl font-black text-slate-900 leading-snug tracking-tight">
                    {currentQ.text}
                  </p>

                  {currentQ.type === 'mcq' && currentQ.options && (
                    <div className="grid grid-cols-1 gap-4">
                      {currentQ.options?.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers({...answers, [currentQ.id]: opt.id})}
                          className={`p-6 rounded-[2.5rem] border-4 text-left font-black text-xl transition-all flex items-center space-x-6 ${
                            answers[currentQ.id] === opt.id 
                            ? 'bg-indigo-600 border-indigo-700 text-white shadow-2xl shadow-indigo-100 scale-[1.03]' 
                            : 'bg-slate-50 border-transparent text-slate-700 hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black ${answers[currentQ.id] === opt.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'theory' && (
                    <div className="space-y-6">
                      <textarea 
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
                        placeholder="Cambridge Candidate Response..." 
                        className="w-full h-80 p-10 bg-slate-50 rounded-[3rem] border-0 focus:ring-4 focus:ring-indigo-100 resize-none text-2xl leading-relaxed shadow-inner font-mono text-slate-950 font-medium transition-all" 
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-10 border-t border-slate-100">
                   <button 
                     disabled={currentIdx === 0}
                     onClick={() => setCurrentIdx(currentIdx - 1)}
                     className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20"
                   >
                     Previous
                   </button>
                   <button 
                     onClick={() => {
                        if (currentIdx < (questions?.length || 0) - 1) {
                          setCurrentIdx(currentIdx + 1);
                        } else {
                          handleSubmit();
                        }
                     }}
                     className="px-10 py-4 bg-slate-950 text-white rounded-[2rem] font-black hover:bg-black transition-all shadow-lg"
                   >
                     {currentIdx === (questions?.length || 0) - 1 ? 'Grade Script' : 'Next Question'}
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Cambridge Exam Hub</h4>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Board</p>
                  <p className="font-black text-indigo-900">CAIE International</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Answered</p>
                  <p className="font-black text-slate-900">{Object.keys(answers).length} / 10</p>
                </div>
              </div>
              <div className="pt-4">
                 <button onClick={handleSubmit} className="w-full py-5 bg-indigo-50 text-indigo-700 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-100 transition-all">
                    Early Marking
                 </button>
              </div>
           </div>
        </div>
      </div>

      {grading && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[200] flex items-center justify-center">
           <div className="text-center space-y-8 animate-in zoom-in-95">
              <div className="relative w-32 h-32 mx-auto">
                 <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center font-black text-white text-3xl">CAIE</div>
              </div>
              <div>
                 <h3 className="text-4xl font-black text-white tracking-tight">Examiner Marking</h3>
                 <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Vetting script against Cambridge marking keys...</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MockExam;
