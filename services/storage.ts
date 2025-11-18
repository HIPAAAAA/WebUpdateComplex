
import { UpdateFeature } from '../types';

const STORAGE_KEY = 'complex_legacy_updates';

export const getStoredUpdates = (): UpdateFeature[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading updates", error);
    return [];
  }
};

export const saveUpdate = (update: UpdateFeature): void => {
  const currentUpdates = getStoredUpdates();
  // Add new update to the beginning of the array
  const newUpdates = [update, ...currentUpdates];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdates));
};

export const updateUpdate = (updatedFeature: UpdateFeature): void => {
  const currentUpdates = getStoredUpdates();
  const index = currentUpdates.findIndex(u => u.id === updatedFeature.id);
  
  if (index !== -1) {
    currentUpdates[index] = updatedFeature;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUpdates));
  } else {
    // If not found in local storage (maybe it was a static constant we are now "overriding" locally), save as new
    // In a real app with backend, this would be a PUT request
    saveUpdate(updatedFeature);
  }
};

export const deleteUpdate = (id: string): void => {
  const currentUpdates = getStoredUpdates();
  const newUpdates = currentUpdates.filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdates));
};

// Helper to convert file to Base64 for image storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
