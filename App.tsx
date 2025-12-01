import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NewsGrid from './components/NewsGrid';
import Footer from './components/Footer';
import LegacyBot from './components/LegacyBot';
import AdminModal from './components/AdminModal';
import { getStoredUpdates, getUpdateDetails } from './services/storage';
import { UpdateFeature } from './types';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [updates, setUpdates] = useState<UpdateFeature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<UpdateFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  // Initial Load
  const refreshUpdates = async () => {
    setIsLoading(true);
    setPage(1);
    // Fetch first 9 items (enough for Hero + 2 rows)
    const result = await getStoredUpdates(1, 9);
    setUpdates(result.data);
    setHasMore(result.pagination.hasMore);
    setIsLoading(false);
  };

  // Load More Handler
  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore) return;
    
    setIsMoreLoading(true);
    const nextPage = page + 1;
    const result = await getStoredUpdates(nextPage, 6);
    
    setUpdates(prev => [...prev, ...result.data]);
    setPage(nextPage);
    setHasMore(result.pagination.hasMore);
    setIsMoreLoading(false);
  };

  // --- Progressive Loading Handler ---
  const handleSelectFeature = async (feature: UpdateFeature | null) => {
    if (!feature) {
      setSelectedFeature(null);
      return;
    }

    // 1. Immediate Feedback: Open the modal with the data we have (Title, Cover, Date)
    // This makes the UI feel instant.
    setSelectedFeature(feature);

    // 2. Background Fetch: If we don't have the full content (HTML/Blocks), fetch it.
    if (!feature.fullContent && !feature.rawBlocks) {
      console.log(`Fetching full details for ${feature.title}...`);
      const fullDetails = await getUpdateDetails(feature.id);
      
      if (fullDetails) {
        // Update the selected feature state with the full details
        setSelectedFeature(prev => {
           // Ensure we are still looking at the same feature before updating
           if (prev && prev.id === fullDetails.id) {
             return fullDetails;
           }
           return prev;
        });
      }
    }
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
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (window.location.pathname.includes('/api/auth/callback') && code) {
        window.history.replaceState({}, document.title, "/");
        setIsAdminOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-legacy-purple selection:text-white relative overflow-x-hidden" id="top">
      
      <Navbar 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        onHome={handleGoHome}
        onNews={handleGoToNews}
      />
      
      <main className="pt-0 relative z-10">
        {isLoading && updates.length === 0 ? (
           <div className="flex h-screen items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-legacy-purple"></div>
           </div>
        ) : (
          <NewsGrid 
              updates={updates} 
              selectedFeature={selectedFeature}
              onSelectFeature={handleSelectFeature}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isMoreLoading={isMoreLoading}
          />
        )}
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