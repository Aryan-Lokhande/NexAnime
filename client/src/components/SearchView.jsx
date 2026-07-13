import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Star, Sparkles, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';

export default function SearchView({ API_BASE_URL, onAnimeClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [recommendationLimit, setRecommendationLimit] = useState(20);
  const [recommendations, setRecommendations] = useState([]);

  // States
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerRef = useRef(null);
  const recsRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`${API_BASE_URL}/animes/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setDropdownOpen(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch recommendations whenever selected anime or limit changes
  useEffect(() => {
    if (selectedAnime) {
      fetchRecommendations();
    }
  }, [selectedAnime, recommendationLimit]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/recommendations/hybrid/${selectedAnime.anime_id}?limit=${recommendationLimit}`
      );
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Error fetching hybrid recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const selectSuggestion = (anime) => {
    setSelectedAnime(anime);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const scrollRecs = (direction) => {
    if (recsRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      recsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderRackSkeleton = () => (
    <div className="flex gap-5 overflow-hidden py-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] h-[260px] sm:h-[300px] skeleton" />
      ))}
    </div>
  );

  return (
    <div className="space-y-10 pb-16">
      
      {/* Search Input Container */}
      <section className="max-w-2xl mx-auto relative z-20 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl sm:text-2xl font-extrabold text-center mb-6 text-white tracking-tight">
          Search Your Favourite Anime!
        </h2>
        <div ref={containerRef} className="relative">
          <div className="relative flex items-center bg-[#13171e] border border-white/10 rounded-2xl p-1 shadow-lg transition-all focus-within:border-rose-500/50 focus-within:shadow-rose-500/5">
            <Search className="ml-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by anime name (Japanese or English)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true); }}
              className="w-full bg-transparent border-0 py-3 px-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none"
            />
            {loadingSuggestions && (
              <Loader2 className="animate-spin mr-3 text-rose-500" size={20} />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#13171e] border border-white/10 rounded-xl max-h-80 overflow-y-auto shadow-2xl z-30 divide-y divide-white/5 no-scrollbar">
              {suggestions.map((anime) => (
                <div
                  key={anime.anime_id}
                  onClick={() => selectSuggestion(anime)}
                  className="flex items-center gap-3 p-3.5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <img
                    src={anime.Image_URL}
                    alt={anime.Name}
                    className="h-12 w-9 object-cover rounded-md bg-slate-950 border border-white/5 flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{anime.Name}</p>
                    {anime.English_name && anime.English_name !== 'UNKNOWN' && (
                      <p className="text-xs text-slate-400 truncate">{anime.English_name}</p>
                    )}
                  </div>
                  {anime.Score > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-400 font-bold bg-[#0b0d10] px-2 py-1 rounded-md border border-amber-400/10">
                      <Star size={12} className="fill-amber-400" />
                      {anime.Score.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Searched Anime Detail Area */}
      {selectedAnime ? (
        <div className="space-y-10 animate-fade-in" style={{ animationDelay: '150ms' }}>
          
          {/* Main Info Card */}
          <section className="glass-panel p-5 sm:p-8 border-white/5">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              
              {/* Cover Image */}
              <div className="w-full md:w-56 max-w-xs mx-auto md:mx-0 flex-shrink-0">
                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg relative bg-slate-950 flex items-center justify-center">
                  {/* Blurred background image */}
                  <img
                    src={selectedAnime.Image_URL}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-40 scale-110"
                  />
                  {/* Centered main image */}
                  <img
                    src={selectedAnime.Image_URL}
                    alt={selectedAnime.Name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                    className="relative max-w-full max-h-full object-contain z-10"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {selectedAnime.Name}
                  </h2>
                  {selectedAnime.English_name && selectedAnime.English_name !== 'UNKNOWN' && (
                    <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
                      {selectedAnime.English_name}
                    </p>
                  )}
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Score</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Star size={14} className="fill-amber-400" />
                      {selectedAnime.Score > 0 ? selectedAnime.Score.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Type</span>
                    <span className="text-sm sm:text-base font-semibold text-rose-300 mt-0.5 block">{selectedAnime.Type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Aired</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 block">{selectedAnime.Aired}</span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Studio</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 block truncate" title={selectedAnime.Studio}>{selectedAnime.Studio}</span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Rating</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 block truncate" title={selectedAnime.Rating}>{selectedAnime.Rating}</span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">Genres</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 block truncate" title={selectedAnime.Genres}>{selectedAnime.Genres}</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Synopsis</h4>
                  <p className="text-sm text-slate-400 leading-relaxed text-justify max-h-40 overflow-y-auto no-scrollbar">
                    {selectedAnime.Synopsis}
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Slider & Recommendations Section */}
          <section className="glass-panel p-5 sm:p-8 border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sliders size={20} className="text-rose-500" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  Adjust Recommendations
                </h3>
              </div>
              
              {/* Slider Controller */}
              <div className="flex items-center gap-4 bg-[#0b0d10] px-4 py-2 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  No. of Recommendations:
                </span>
                <div className="flex gap-1">
                  {[10, 20, 30, 40].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRecommendationLimit(val)}
                      className={`px-3 py-1 text-xs font-extrabold rounded-md transition-all ${
                        recommendationLimit === val
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations Shelf */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-rose-500" />
                  <h4 className="text-xl font-bold tracking-tight text-white">
                    Watch these next!
                  </h4>
                </div>
                {recommendations.length > 0 && !loadingRecs && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scrollRecs('left')}
                      className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => scrollRecs('right')}
                      className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {loadingRecs ? (
                renderRackSkeleton()
              ) : recommendations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No titles that matched your query were found.
                </div>
              ) : (
                <div 
                  ref={recsRef}
                  className="anime-rack-container no-scrollbar"
                >
                  {recommendations.map((anime) => (
                    <div key={anime.anime_id} className="anime-rack-item">
                      <AnimeCard anime={anime} onClick={onAnimeClick} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel py-20 text-center text-slate-500 animate-fade-in">
          <Search size={48} className="mx-auto text-slate-600 mb-4 stroke-[1.5]" />
          <p className="text-sm font-semibold max-w-xs mx-auto">
            Search for an anime above to view its details and receive personalized hybrid recommendations!
          </p>
        </div>
      )}

    </div>
  );
}
