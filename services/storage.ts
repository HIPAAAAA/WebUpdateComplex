import { UpdateFeature } from '../types';

// API URL - Uses relative path which works with Vercel rewrites
const API_URL = '/api/updates';

export const getStoredUpdates = async (): Promise<UpdateFeature[]> => {
  try {
    // Added headers and cache: 'no-store' to prevent browser caching issues
    // This ensures that when you delete/add an item, the list updates immediately
    const response = await fetch(API_URL, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch updates');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading updates from DB", error);
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
    // encodeURIComponent ensures special characters in IDs don't break the URL
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

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};