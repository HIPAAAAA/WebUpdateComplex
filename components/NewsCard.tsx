import React from 'react';
import { UpdateFeature, TagType } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  feature: UpdateFeature;
  onClick: (feature: UpdateFeature) => void;
}

const getTagColor = (tag: TagType) => {
  switch (tag) {
    case TagType.SYSTEM: return 'text-blue-400';
    case TagType.ECONOMY: return 'text-green-400';
    case TagType.JOBS: return 'text-red-400';
    case TagType.MAP: return 'text-legacy-gold';
    case TagType.EVENT: return 'text-legacy-purple';
    default: return 'text-gray-400';
  }
};

const NewsCard: React.FC<NewsCardProps> = ({ feature, onClick }) => {
  return (
    <div 
      onClick={() => onClick(feature)}
      className="group relative bg-legacy-card rounded-none border-l-2 border-transparent hover:border-legacy-purple cursor-pointer transition-all duration-300 hover:bg-white/5 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-900">
        <img 
          src={feature.imageUrl} 
          alt={feature.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
            {feature.version || 'UPDATE'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${getTagColor(feature.tag)}`}>
                {feature.tag}
            </span>
            <span className="text-gray-600 text-xs font-mono">{feature.date}</span>
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight group-hover:text-legacy-purple transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
          {feature.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Leer Articulo</span>
            <ArrowUpRight size={16} className="text-legacy-purple opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;