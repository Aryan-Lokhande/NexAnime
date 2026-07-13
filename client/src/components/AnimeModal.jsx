import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Heart, Award, Users, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';

export default function AnimeModal({ animeId, API_BASE_URL, onClose, onSelectRecommend }) {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const modalRef = useRef(null);
  const shelfRef = useRef(null);

  // Fetch anime details and recommendations
  useEffect(() => {
    if (animeId) {
      fetchAnimeDetails(animeId);
      fetchRecommendations(animeId);
    }
  }, [animeId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll to top of modal on detail change
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [animeId]);

  const fetchAnimeDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/animes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnime(data);
      }
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (id) => {
    setLoadingRecs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations/hybrid/${id}?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Error loading modal recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRecommendClick = (recAnime) => {
    // Call the parent state modification to update the active animeId in the modal
    onSelectRecommend(recAnime.anime_id);
  };

  const scrollShelf = (direction) => {
    if (shelfRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      shelfRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!animeId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      
      {/* Non-scrollable Outer Wrapper */}
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#13171e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Close Button (never scrolls away) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-xl bg-slate-900/90 border border-white/5 text-slate-400 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/10 transition-all z-30 shadow-md backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        {/* Scrollable Inner Container */}
        <div 
          ref={modalRef}
          className="w-full overflow-y-auto p-5 sm:p-8 pt-12 sm:pt-14 "
        >
          {loading ? (
            /* Loading State */
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Loading details...</p>
            </div>
          ) : anime ? (
            <div className="space-y-8">
              
              {/* Upper Details Block */}
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mt-4 md:mt-0">
                
                {/* Cover Image with blurred background technique */}
                <div className="w-full md:w-52 max-w-[200px] mx-auto md:mx-0 flex-shrink-0">
                  <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-950 relative flex items-center justify-center">
                    {/* Blurred background image */}
                    <img
                      src={anime.Image_URL}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.svg';
                      }}
                      className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-40 scale-110"
                    />
                    {/* Centered main image */}
                    <img
                      src={anime.Image_URL}
                      alt={anime.Name}
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
                      {anime.Name}
                    </h2>
                    {anime.English_name && anime.English_name !== 'UNKNOWN' && (
                      <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
                        {anime.English_name}
                      </p>
                    )}
                  </div>

                  {/* Score and Stats row */}
                  <div className="flex flex-wrap gap-2.5">
                    {anime.Score > 0 && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/10 border border-amber-400/20 text-amber-400">
                        <Star size={14} className="fill-amber-400" />
                        {anime.Score.toFixed(2)} Score
                      </span>
                    )}
                    {anime.Favorites > 0 && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <Heart size={14} className="fill-rose-500" />
                        {anime.Favorites.toLocaleString()} Favorites
                      </span>
                    )}
                    {anime.Members > 0 && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Users size={14} />
                        {anime.Members.toLocaleString()} Members
                      </span>
                    )}
                    {anime.Rank && anime.Rank !== 'UNKNOWN' && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Award size={14} />
                        Rank #{anime.Rank}
                      </span>
                    )}
                  </div>

                  {/* Secondary details grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Type</span>
                      <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{anime.Type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Aired</span>
                      <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{anime.Aired}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Studio</span>
                      <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate" title={anime.Studio}>{anime.Studio}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Genres</span>
                      <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate" title={anime.Genres}>{anime.Genres}</span>
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Synopsis</h4>
                    <p className="text-sm text-slate-300 leading-relaxed text-justify max-h-48 overflow-y-auto no-scrollbar">
                      {anime.Synopsis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inner Recommendation Shelf */}
              <div className="pt-6 border-t border-white/5 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-rose-500" />
                    <h3 className="text-md font-bold text-white uppercase tracking-wider">
                      Recommended Additions
                    </h3>
                  </div>
                  {recommendations.length > 0 && !loadingRecs && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => scrollShelf('left')}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        onClick={() => scrollShelf('right')}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-white transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {loadingRecs ? (
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-shrink-0 w-[120px] sm:w-[140px] h-[190px] sm:h-[220px] skeleton" />
                    ))}
                  </div>
                ) : recommendations.length === 0 ? (
                  <p className="text-xs text-slate-500">No recommendation matches found.</p>
                ) : (
                  <div 
                    ref={shelfRef}
                    className="flex gap-4 overflow-x-auto py-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
                  >
                    {recommendations.map((recAnime) => (
                      <div 
                        key={recAnime.anime_id} 
                        className="flex-shrink-0 w-[120px] sm:w-[140px] snap-start"
                      >
                        {/* Nested mini Card layout with blurred background technique */}
                        <div 
                          onClick={() => handleRecommendClick(recAnime)}
                          className="group cursor-pointer flex flex-col justify-between w-full h-[190px] sm:h-[220px] bg-slate-900/60 rounded-xl overflow-hidden border border-white/5 shadow hover:border-rose-500/30 transition-all duration-300"
                        >
                          <div className="relative w-full h-[80%] overflow-hidden bg-slate-950 flex items-center justify-center">
                            {/* Blurred bg image */}
                            <img 
                              src={recAnime.Image_URL} 
                              alt=""
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.svg';
                              }}
                              className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110 transition-transform duration-300 group-hover:scale-120"
                              loading="lazy"
                            />
                            {/* Centered main image */}
                            <img 
                              src={recAnime.Image_URL} 
                              alt={recAnime.Name} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.svg';
                              }}
                              className="relative max-w-full max-h-full object-contain z-10 transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-1.5 bg-slate-900 text-center flex items-center justify-center h-[20%]">
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-300 truncate w-full group-hover:text-white">
                              {recAnime.Name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">Failed to render details.</div>
          )}
        </div>
      </div>

    </div>
  );
}
