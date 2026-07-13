import React from 'react';
import { Star } from 'lucide-react';

export default function AnimeCard({ anime, onClick }) {
  const { Name, Image_URL, Score, Type } = anime;

  // Fallback image handler
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = '/placeholder.svg';
  };

  return (
    <div 
      onClick={() => onClick(anime)}
      className="group relative cursor-pointer flex flex-col justify-between w-full h-[260px] sm:h-[300px] bg-slate-900 rounded-xl overflow-hidden border border-white/5 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5"
    >
      {/* Anime Image */}
      <div className="relative w-full h-[80%] overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Blurred background for padding out smaller aspect ratios */}
        <img 
          src={Image_URL} 
          alt="" 
          onError={handleImgError}
          className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110 transition-transform duration-500 group-hover:scale-120"
          loading="lazy"
        />

        {/* Uncropped centered main poster */}
        <img 
          src={Image_URL} 
          alt={Name} 
          onError={handleImgError}
          className="relative max-w-full max-h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay Info Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
          {Score > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-[#13171e]/90 text-amber-400 backdrop-blur-md border border-amber-400/20">
              <Star size={10} className="fill-amber-400" />
              {Score.toFixed(2)}
            </span>
          )}
          {Type && Type !== 'UNKNOWN' && (
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-[#13171e]/90 text-rose-300 backdrop-blur-md border border-rose-500/10">
              {Type}
            </span>
          )}
        </div>
      </div>

      {/* Anime Name and Text */}
      <div className="p-3 bg-slate-900/90 h-[20%] flex items-center justify-center border-t border-white/5">
        <p className="text-xs sm:text-sm font-semibold text-slate-200 text-center line-clamp-1 w-full group-hover:text-white transition-colors duration-200">
          {Name}
        </p>
      </div>
    </div>
  );
}
