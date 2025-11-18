
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NewsGrid from './components/NewsGrid';
import Footer from './components/Footer';
import LegacyBot from './components/LegacyBot';
import AdminModal from './components/AdminModal';
import { getStoredUpdates } from './services/storage';
import { LEGACY_UPDATE_DATA } from './constants';
import { UpdateFeature } from './types';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [updates, setUpdates] = useState<UpdateFeature[]>([]);

  const refreshUpdates = () => {
    const localData = getStoredUpdates();
    // Combine local updates (which are newer) with static constants
    // Note: In a real app, this would all come from one API
    setUpdates([...localData, ...LEGACY_UPDATE_DATA]);
  };

  useEffect(() => {
    refreshUpdates();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-legacy-purple selection:text-white">
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />
      
      <main className="pt-0">
        <NewsGrid updates={updates} />
      </main>
      
      <Footer />
      <LegacyBot />
      
      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onUpdateAdded={refreshUpdates}
      />
    </div>
  );
}

export default App;
