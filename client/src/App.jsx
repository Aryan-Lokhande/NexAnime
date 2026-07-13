import React, { useState } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import AnimeModal from './components/AnimeModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);

  // Helper to open details modal when clicking an anime card
  const handleAnimeClick = (anime) => {
    setSelectedAnimeId(anime.anime_id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-200">
      
      <div className="space-y-8">
        {/* Navigation & Header Banner */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Selection */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
          {activeTab === 'home' ? (
            <HomeView 
              API_BASE_URL={API_BASE_URL} 
              onAnimeClick={handleAnimeClick} 
            />
          ) : (
            <SearchView 
              API_BASE_URL={API_BASE_URL} 
              onAnimeClick={handleAnimeClick} 
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#090b0e] border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} NexAnime. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://myanimelist.net" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs sm:text-sm text-slate-500 hover:text-rose-500 transition-colors font-medium"
            >
              MyAnimeList API
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Collaborative & Content Filtering AI
            </span>
          </div>
        </div>
      </footer>

      {/* Details Modal overlay */}
      {selectedAnimeId && (
        <AnimeModal 
          animeId={selectedAnimeId}
          API_BASE_URL={API_BASE_URL}
          onClose={() => setSelectedAnimeId(null)}
          onSelectRecommend={(id) => setSelectedAnimeId(id)}
        />
      )}

    </div>
  );
}
