import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { UpdateFeature } from '../types';

interface HeroProps {
  feature: UpdateFeature;
  onClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ feature, onClick }) => {
  return (
    // Added animate-fade-in-up class
    <div className="relative w-full min-h-[80vh] pt-20 flex items-center overflow-hidden animate-fade-in-up">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-legacy-purple/10 to-transparent z-0"></div>
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-legacy-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="order-2 lg:order-1 space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-legacy-gold text-black text-xs font-black px-3 py-1 uppercase tracking-wider rounded-full">
              {feature.version || 'DESTACADO'}
            </span>
            <span className="flex items-center gap-2 text-legacy-purple text-sm font-medium">
              <Calendar size={14} />
              {feature.date}
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.9] tracking-tighter uppercase">
            {feature.title}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-legacy-purple to-legacy-accent text-4xl md:text-5xl mt-2">
              {feature.subtitle}
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed border-l-4 border-legacy-purple/50 pl-4">
            {feature.description}
          </p>

          <div className="pt-4">
            <button 
              onClick={onClick}
              className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-legacy-gold transition-all duration-300 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                LEER NOTAS DEL PARCHE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </span>
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 lg:order-2 relative group cursor-pointer" onClick={onClick}>
          <div className="absolute inset-0 bg-legacy-purple blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
            <img 
              src={feature.imageUrl} 
              alt={feature.title} 
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Overlay Badge */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-20">
               <p className="text-white font-display text-xl">VER DETALLES COMPLETOS</p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Bottom fade to blend with grid */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505]/50 to-transparent z-10"></div>
    </div>
  );
};

export default Hero;