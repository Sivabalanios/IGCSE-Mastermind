
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/study-hub', label: 'Study Hub', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/tutor', label: 'Grader', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { path: '/mock-exam', label: 'Mock Exam', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/resources', label: 'Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      <aside className="hidden md:flex w-64 bg-indigo-950 text-white flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tight">CAIE Master</h1>
          <p className="text-indigo-400 text-[10px] mt-1 uppercase font-bold tracking-[0.2em]">Cambridge AI</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                location.pathname === item.path 
                ? 'bg-white text-indigo-950 shadow-lg shadow-indigo-900/50' 
                : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <svg className={`w-5 h-5 ${location.pathname === item.path ? 'text-indigo-600' : 'text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center font-black shadow-lg">ST</div>
            <div>
              <p className="text-sm font-bold">CAIE Hub</p>
              <p className="text-[10px] text-indigo-400 font-bold">Ver: 2.2.0-CAIE</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 p-4 md:px-8 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
               <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></span>
               CAIE (Cambridge) Standards Active
             </div>
          </div>
        </header>
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t flex justify-around p-4 z-20">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
