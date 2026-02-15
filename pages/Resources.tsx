
import React, { useState, useEffect } from 'react';
import { Subject, Resource } from '../types';
import { fetchResources } from '../services/geminiService';

const Resources: React.FC = () => {
  const [subject, setSubject] = useState<Subject>('Biology (0610)');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

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

  const getResources = async (s: Subject) => {
    setLoading(true);
    try {
      const data = await fetchResources(s);
      setResources(data.map((r, i) => ({ ...r, id: i.toString() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getResources(subject);
  }, [subject]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Cambridge Resource Hub</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Reliable, vetted materials for CAIE IGCSE students.</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 px-6 py-4 rounded-[2rem] flex items-center space-x-4">
             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <div>
                <p className="text-[11px] font-black text-red-700 uppercase tracking-widest leading-none mb-1">Domestic Warning</p>
                <p className="text-xs font-bold text-red-600 leading-tight">
                  Cognito, AQA, and Edexcel Domestic boards are <span className="underline">NOT reliable</span> for Cambridge Syllabus students.
                </p>
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${
                subject === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-8">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Trusted CAIE Global Hubs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'PapaCambridge', link: 'https://papacambridge.com' },
            { name: 'Save My Exams', link: 'https://www.savemyexams.co.uk/igcse/' },
            { name: 'GCE Guide', link: 'https://gceguide.com' },
            { name: 'ZNotes', link: 'https://znotes.org' }
          ].map(hub => (
            <a key={hub.name} href={hub.link} target="_blank" className="bg-white p-4 rounded-2xl border border-indigo-100 text-center font-black text-indigo-700 text-xs hover:shadow-md transition-all">
              {hub.name}
            </a>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  resource.type === 'Book' ? 'bg-blue-100 text-blue-700' : 
                  resource.type === 'Mock Paper' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {resource.type}
                </span>
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-400 group-hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
              <p className="text-xs text-slate-500 mb-8 flex-1 leading-relaxed font-medium">{resource.description}</p>
              <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center bg-slate-900 text-white font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-widest hover:bg-black hover:shadow-lg shadow-indigo-100"
              >
                Access Verified Resource
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
