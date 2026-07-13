import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter, Compass } from 'lucide-react';
import AnimeCard from './AnimeCard';

const GENRES = [
  "All", "Comedy", "Fantasy", "Action", "Adventure", "Sci-Fi", "Drama", "Romance",
  "Slice of Life", "Supernatural", "Mystery", "Avant Garde", "Ecchi", "Sports",
  "Horror", "Suspense", "Award Winning", "Boys Love", "Gourmet", "Girls Love"
];

const RATINGS = [
  "All", "PG-13 - Teens 13 or older", "G - All Ages", "PG - Children",
  "R - 17+ (violence & profanity)", "R+ - Mild Nudity"
];

const TYPES = [
  "All", "TV", "Movie", "OVA", "ONA", "Music", "Special"
];

const SOURCES = [
  "All", "Original", "Manga", "Novel", "Other"
];

export default function HomeView({ API_BASE_URL, onAnimeClick }) {
  // Filter states
  const [genre, setGenre] = useState('All');
  const [rating, setRating] = useState('All');
  const [type, setType] = useState('All');
  const [source, setSource] = useState('All');

  // Recommendations data states
  const [topPicks, setTopPicks] = useState([]);
  const [recentHits, setRecentHits] = useState([]);
  const [cultClassics, setCultClassics] = useState([]);

  // Loading states
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingClassics, setLoadingClassics] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for horizontal scrolling
  const picksRef = useRef(null);
  const recentRef = useRef(null);
  const classicsRef = useRef(null);

  // Fetch static shelves (Recent and Classics) once on mount
  useEffect(() => {
    fetchRecentHits();
    fetchCultClassics();
  }, []);

  // Fetch Top Picks whenever filters change
  useEffect(() => {
    fetchTopPicks();
  }, [genre, rating, type, source]);

  const fetchTopPicks = async () => {
    setLoadingPicks(true);
    try {
      const url = `${API_BASE_URL}/recommendations/popular?genre=${encodeURIComponent(genre)}&rating=${encodeURIComponent(rating)}&type=${encodeURIComponent(type)}&source=${encodeURIComponent(source)}&rec_type=top&limit=30`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load Top Picks');
      const data = await res.json();
      setTopPicks(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch recommendations. Please check server connections.');
    } finally {
      setLoadingPicks(false);
    }
  };

  const fetchRecentHits = async () => {
    setLoadingRecent(true);
    try {
      const url = `${API_BASE_URL}/recommendations/popular?rec_type=recent&limit=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load Recent Hits');
      const data = await res.json();
      setRecentHits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const fetchCultClassics = async () => {
    setLoadingClassics(true);
    try {
      const url = `${API_BASE_URL}/recommendations/popular?rec_type=classic&limit=20`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load Cult Classics');
      const data = await res.json();
      setCultClassics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClassics(false);
    }
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderRackSkeleton = () => (
    <div className="flex gap-5 overflow-hidden py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] h-[260px] sm:h-[300px] skeleton" />
      ))}
    </div>
  );

  return (
    <div className="space-y-12 pb-16">
      
      {/* Filtering Section */}
      <section className="glass-panel p-6 border-white/5 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
          <Filter size={18} className="text-rose-500" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
            Filter Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Genre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-white/20 focus:border-rose-500"
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-white/20 focus:border-rose-500"
            >
              {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-white/20 focus:border-rose-500"
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-white/20 focus:border-rose-500"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-center text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Shelf 1: Top Picks */}
      <section className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <Compass size={22} className="text-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Top Picks For You!
            </h2>
          </div>
          {topPicks.length > 0 && !loadingPicks && (
            <div className="flex gap-2">
              <button 
                onClick={() => scroll(picksRef, 'left')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scroll(picksRef, 'right')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loadingPicks ? (
          renderRackSkeleton()
        ) : topPicks.length === 0 ? (
          <div className="glass-panel p-10 text-center text-slate-400 text-sm">
            No titles matched your filter criteria. Try adjusting the filters above.
          </div>
        ) : (
          <div 
            ref={picksRef}
            className="anime-rack-container no-scrollbar"
          >
            {topPicks.map((anime) => (
              <div key={anime.anime_id} className="anime-rack-item">
                <AnimeCard anime={anime} onClick={onAnimeClick} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shelf 2: Recent Hits */}
      <section className="relative animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Recent Hits!
          </h2>
          {recentHits.length > 0 && !loadingRecent && (
            <div className="flex gap-2">
              <button 
                onClick={() => scroll(recentRef, 'left')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scroll(recentRef, 'right')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loadingRecent ? (
          renderRackSkeleton()
        ) : (
          <div 
            ref={recentRef}
            className="anime-rack-container no-scrollbar"
          >
            {recentHits.map((anime) => (
              <div key={anime.anime_id} className="anime-rack-item">
                <AnimeCard anime={anime} onClick={onAnimeClick} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shelf 3: Cult Classics */}
      <section className="relative animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Cult Classics!
          </h2>
          {cultClassics.length > 0 && !loadingClassics && (
            <div className="flex gap-2">
              <button 
                onClick={() => scroll(classicsRef, 'left')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scroll(classicsRef, 'right')}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loadingClassics ? (
          renderRackSkeleton()
        ) : (
          <div 
            ref={classicsRef}
            className="anime-rack-container no-scrollbar"
          >
            {cultClassics.map((anime) => (
              <div key={anime.anime_id} className="anime-rack-item">
                <AnimeCard anime={anime} onClick={onAnimeClick} />
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
