import React from 'react';
import { Instagram, Youtube, Twitter, Disc } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">COMPLEX <span className="text-legacy-gold">LEGACY</span></span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              El servidor de Roleplay hispano más inmersivo. Vive una segunda vida donde tus decisiones realmente importan. Únete a una comunidad de más de 50,000 jugadores.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-legacy-gold transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-legacy-gold transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-legacy-gold transition-colors"><Youtube size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors"><Disc size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Normativa General</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Código Penal</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Postulaciones LSPD</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Postulaciones EMS</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Donaciones</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Apelaciones de Ban</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Reportar Bug</a></li>
              <li><a href="#" className="hover:text-legacy-gold transition-colors">Estado del Servidor</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs">
            © 2023 Complex Legacy RP. Not affiliated with Rockstar Games.
          </p>
          <div className="flex gap-4 text-xs text-gray-600 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;