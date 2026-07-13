import React from 'react';
import { Home, Search, Film } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="relative w-full overflow-hidden">
      {/* Banner Container */}
      {/* <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
        <img 
          src="/static/img" 
          alt="Banner" 
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-75 contrast-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-transparent to-black/30" />
      </div> */}

      {/* Navigation & Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative ">
        <div className="glass-panel p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-4">
            {/* <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-violet-600 p-[2px] shadow-lg animate-pulse-glow">
              <div className="h-full w-full bg-[#13171e] rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/static/logo.png" 
                  alt="NexAnime" 
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <Film className="absolute text-rose-500 h-6 w-6 pointer-events-none" style={{ display: 'none' }} />
              </div>
            </div> */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
                Nex Anime
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide uppercase">
                AI-Powered Anime Recommender
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#0b0d10]/60 p-1.5 rounded-xl border border-white/5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Home size={16} />
              Home
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Search size={16} />
              Search
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
