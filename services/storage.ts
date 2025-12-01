import { UpdateFeature } from '../types';

// API URL - Uses relative path which works with Vercel rewrites
const API_URL = '/api/updates';

export interface PaginatedResult {
  data: UpdateFeature[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasMore: boolean;
  }
}

export const getStoredUpdates = async (page: number = 1, limit: number = 6): Promise<PaginatedResult> => {
  try {
    // Added headers and cache: 'no-store' to prevent browser caching issues
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    
    if (!response.ok) {
        // Log the text response for debugging
        const text = await response.text();
        console.error('API Error Response:', text);
        throw new Error(`Failed to fetch updates: ${response.status}`);
    }
    const result = await response.json();
    
    // Fallback for backward compatibility if API returns array directly (during migration)
    if (Array.isArray(result)) {
        return {
            data: result,
            pagination: { total: result.length, page: 1, pages: 1, hasMore: false }
        };
    }
    
    return result;
  } catch (error) {
    console.error("Error loading updates from DB", error);
    // Return empty structure instead of crashing app
    return { data: [], pagination: { total: 0, page: 1, pages: 0, hasMore: false } };
  }
};

// NEW: Fetch full details for a single update (Lazy Loading)
export const getUpdateDetails = async (id: string): Promise<UpdateFeature | null> => {
  try {
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
        cache: 'no-store'
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching update details", error);
    return null;
  }
};

export const saveUpdate = async (update: UpdateFeature): Promise<void> => {
  try {
    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
    });
  } catch (error) {
    console.error("Error saving update", error);
    throw error;
  }
};

export const updateUpdate = async (updatedFeature: UpdateFeature): Promise<void> => {
  try {
    await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFeature),
    });
  } catch (error) {
    console.error("Error updating feature", error);
    throw error;
  }
};

export const deleteUpdate = async (id: string): Promise<void> => {
  try {
    await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });
  } catch (error) {
    console.error("Error deleting update", error);
    throw error;
  }
};

// --- IMAGE COMPRESSION LOGIC ---
// Updated: Reduced constraints to max 1000px and 0.7 quality for faster loading
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Optimización agresiva para evitar cargas lentas
        const MAX_WIDTH = 1000;
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 0.7 quality (Good balance)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};