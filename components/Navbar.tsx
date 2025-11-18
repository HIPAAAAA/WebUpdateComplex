import React, { useState } from 'react';
import { Menu, X, ExternalLink, Home, Lock } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface NavbarProps {
  onOpenAdmin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Area */}
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer flex items-center">
                {/* Logo Clean: Raw image, no filters, no borders. */}
                <img 
                    src={LOGO_URL} 
                    alt="Complex Legacy Logo" 
                    className="h-12 w-auto object-contain"
                />
            </div>
            <div className="flex flex-col justify-center">
                <span className="font-display font-bold text-xl tracking-wider text-white leading-none">
                  COMPLEX <span className="text-legacy-purple">LEGACY</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-legacy-gold font-bold">
                  Update Portal
                </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
              <Home size={16} /> Inicio
            </a>
            <a href="#" className="text-white text-sm font-bold border-b-2 border-legacy-gold pb-1">
              Novedades
            </a>
            <button className="bg-legacy-purple hover:bg-legacy-accent text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg shadow-legacy-purple/20 flex items-center gap-2 border border-white/10">
              <ExternalLink size={16} />
              Discord
            </button>
            {/* Admin Trigger */}
            <button 
              onClick={onOpenAdmin}
              className="text-gray-600 hover:text-legacy-purple transition-colors p-2 rounded-full hover:bg-white/5"
              title="Admin Login"
            >
              <Lock size={16} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <a href="#" className="block text-gray-300 hover:text-white py-2">Inicio</a>
            <a href="#" className="block text-legacy-gold font-bold py-2">Novedades</a>
            <a href="#" className="block text-gray-300 hover:text-white py-2">Discord</a>
            <button onClick={onOpenAdmin} className="text-gray-500 hover:text-white flex items-center gap-2 py-2">
              <Lock size={14} /> Admin Area
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;