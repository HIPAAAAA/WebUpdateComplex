
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NewsGrid from './components/NewsGrid';
import Footer from './components/Footer';
import LegacyBot from './components/LegacyBot';
import AdminModal from './components/AdminModal';
import { getStoredUpdates } from './services/storage';
import { UpdateFeature } from './types';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [updates, setUpdates] = useState<UpdateFeature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<UpdateFeature | null>(null);

  const refreshUpdates = () => {
    // Now getStoredUpdates handles the merging of Local + Static - Deleted
    const data = getStoredUpdates();
    setUpdates(data);
  };

  // Navigation Handlers
  const handleGoHome = () => {
    setSelectedFeature(null); // Close article if open
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToNews = () => {
    setSelectedFeature(null); // Close article if open
    // Allow time for modal to close then scroll
    setTimeout(() => {
        const element = document.getElementById('more-updates');
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navbarHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }, 100);
  };

  useEffect(() => {
    refreshUpdates();

    // --- Discord OAuth Handler ---
    // Check if we are returning from Discord login
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    // Also check path to ensure we are on the callback route (handled by vercel.json rewrite)
    if (window.location.pathname.includes('/api/auth/callback') && code) {
        console.log("Discord Auth Code received:", code);
        
        // 1. Clean the URL to look professional (remove ?code=...)
        window.history.replaceState({}, document.title, "/");

        // 2. Open Admin Panel
        setIsAdminOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-legacy-purple selection:text-white relative overflow-x-hidden" id="top">
      
      {/* Navbar passed with navigation handlers */}
      <Navbar 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        onHome={handleGoHome}
        onNews={handleGoToNews}
      />
      
      <main className="pt-0 relative z-10">
        <NewsGrid 
            updates={updates} 
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
        />
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
