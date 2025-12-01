import { UpdateFeature } from '../types';

// API URL - Uses relative path which works with Vercel rewrites
const API_URL = '/api/updates';

export const getStoredUpdates = async (): Promise<UpdateFeature[]> => {
  try {
    // Added headers and cache: 'no-store' to prevent browser caching issues
    const response = await fetch(API_URL, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    
    if (!response.ok) {
        // Log the text response for debugging (it might be an HTML error page from Vercel)
        const text = await response.text();
        console.error('API Error Response:', text);
        throw new Error(`Failed to fetch updates: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading updates from DB", error);
    // Return empty array instead of crashing app
    return [];
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
// Compresses images to max 1200px width and JPEG quality 0.8
// This reduces a 5MB PNG to ~200KB JPEG.
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
        
        const MAX_WIDTH = 1200;
        
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
        
        // Export as JPEG with 0.8 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};