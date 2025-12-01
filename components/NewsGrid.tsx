
import React, { useEffect } from 'react';
import NewsCard from './NewsCard';
import Hero from './Hero';
import { UpdateFeature } from '../types';
import { X, ChevronLeft, Calendar, Tag, Share2 } from 'lucide-react';

interface NewsGridProps {
  updates: UpdateFeature[];
  selectedFeature: UpdateFeature | null;
  onSelectFeature: (feature: UpdateFeature | null) => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({ updates, selectedFeature, onSelectFeature }) => {
  
  // Logic to find the Priority Feature
  const featuredUpdate = updates.find(u => u.isFeatured) || updates[0];
  const otherUpdates = updates.filter(u => u.id !== featuredUpdate?.id);
  const relatedUpdates = updates
    .filter(u => u.id !== selectedFeature?.id)
    .slice(0, 3);

  useEffect(() => {
    if (selectedFeature) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
  }, [selectedFeature]);

  // --- SKELETON LOADING UI ---
  // If no data exists yet (loading state or empty DB), show this instead of text
  if (!featuredUpdate) {
      return (
        <div className="min-h-screen bg-transparent animate-pulse">
            {/* Skeleton Hero */}
            <div className="relative w-full h-[80vh] bg-white/5 flex items-center justify-center">
                 <div className="max-w-7xl w-full px-8 grid grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <div className="h-6 w-32 bg-white/10 rounded-full"></div>
                        <div className="h-20 w-3/4 bg-white/10 rounded-xl"></div>
                        <div className="h-4 w-full bg-white/10 rounded"></div>
                        <div className="h-4 w-2/3 bg-white/10 rounded"></div>
                        <div className="h-12 w-48 bg-white/10 rounded-full mt-8"></div>
                     </div>
                     <div className="h-[400px] bg-white/5 rounded-2xl border border-white/5"></div>
                 </div>
            </div>
            
            {/* Skeleton Grid */}
            <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="h-8 w-64 bg-white/10 rounded mb-12"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="aspect-[16/9] bg-white/5 rounded-xl border border-white/5"></div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-transparent">
      
      {/* Hero Section (Featured Update) */}
      <Hero feature={featuredUpdate} onClick={() => onSelectFeature(featuredUpdate)} />

      {/* Grid Section */}
      <section id="more-updates" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-white/20 flex-grow"></div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">
                Historial de Actualizaciones
            </h2>
            <div className="h-px bg-white/20 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherUpdates.map((feature) => (
            <NewsCard 
              key={feature.id} 
              feature={feature} 
              onClick={onSelectFeature} 
            />
          ))}
        </div>
      </section>

      {/* Full Screen Article View Overlay */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
          
          <div className="absolute top-0 left-0 w-full min-h-full z-0 bg-dot-white bg-[length:60px_60px] pointer-events-none [mask-image:linear-gradient(to_right,white_0%,transparent_10%,transparent_90%,white_100%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-legacy-purple/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

          {/* Article Navigation Bar */}
          <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between mt-20">
            <button 
                onClick={() => onSelectFeature(null)}
                className="flex items-center gap-2 text-white hover:text-legacy-purple transition-colors rounded-full hover:bg-white/5 px-3 py-2"
            >
                <ChevronLeft size={20} />
                <span className="font-bold text-sm uppercase tracking-wider">Volver</span>
            </button>
            <span className="text-gray-500 text-sm font-mono hidden md:block">{selectedFeature.version || 'UPDATE'}</span>
            <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"><Share2 size={18} /></button>
                <button onClick={() => onSelectFeature(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                    <X size={18} />
                </button>
            </div>
          </div>

          {/* Article Header Image */}
          <div className="relative h-[50vh] w-full">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10"></div>
             <img 
                src={selectedFeature.secondaryImage || selectedFeature.imageUrl} 
                alt={selectedFeature.title}
                className="w-full h-full object-cover" 
             />
             <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-20 max-w-5xl mx-auto">
                <div className="flex gap-3 mb-4">
                    <span className="bg-legacy-purple text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                        {selectedFeature.tag}
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-2 uppercase leading-none">
                    {selectedFeature.title}
                </h1>
                {selectedFeature.subtitle && (
                    <h2 className="text-2xl md:text-3xl text-legacy-gold font-display uppercase mb-6">
                        {selectedFeature.subtitle}
                    </h2>
                )}
                <div className="flex items-center gap-6 text-gray-400 text-sm font-mono border-t border-white/10 pt-4 inline-flex">
                    <span className="flex items-center gap-2"><Calendar size={14}/> {selectedFeature.date}</span>
                    <span className="flex items-center gap-2"><Tag size={14}/> {selectedFeature.tag}</span>
                </div>
             </div>
          </div>

          {/* Article Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 article-content">
            <article className="prose prose-invert prose-xl max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:text-legacy-purple prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-legacy-purple prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-8">
                <div dangerouslySetInnerHTML={{ __html: selectedFeature.fullContent }} />
            </article>
            
            <div className="mt-20 p-8 bg-legacy-purple/10 border border-legacy-purple/20 rounded-3xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-legacy-purple/20 blur-xl group-hover:bg-legacy-purple/30 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-display text-white mb-4">¿LISTO PARA PROBARLO?</h3>
                  <button className="bg-white text-black font-bold px-8 py-3 uppercase tracking-widest hover:bg-legacy-gold transition-all rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:scale-105">
                      Conectar al Servidor
                  </button>
                </div>
            </div>
          </div>

          {/* Related Updates Section */}
          {relatedUpdates.length > 0 && (
            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20 border-t border-white/10 pt-12">
              <h3 className="text-2xl font-display text-white mb-8 uppercase tracking-wider text-center md:text-left">
                Noticias Relacionadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {relatedUpdates.map(related => (
                    <div key={related.id} className="transform scale-95 opacity-80 hover:scale-100 hover:opacity-100 transition-all duration-300">
                      <NewsCard feature={related} onClick={onSelectFeature} />
                    </div>
                 ))}
              </div>
            </div>
          )}
          
          {/* Footer inside modal */}
          <div className="py-8 text-center text-gray-600 text-sm border-t border-white/5 bg-[#050505] relative z-10">
            Complex Legacy News Portal
          </div>

        </div>
      )}
    </div>
  );
};

export default NewsGrid;
