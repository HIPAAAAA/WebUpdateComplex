
import { UpdateFeature } from '../types';
import { LEGACY_UPDATE_DATA } from '../constants';

const STORAGE_KEY = 'complex_legacy_updates';
const DELETED_IDS_KEY = 'complex_legacy_deleted_ids';

// Helper to get deleted IDs
const getDeletedIds = (): string[] => {
  try {
    const stored = localStorage.getItem(DELETED_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getStoredUpdates = (): UpdateFeature[] => {
  try {
    // 1. Get Local Updates (Custom ones added by admin)
    const stored = localStorage.getItem(STORAGE_KEY);
    const localUpdates: UpdateFeature[] = stored ? JSON.parse(stored) : [];
    
    // 2. Get Deleted IDs (Static ones that were removed)
    const deletedIds = getDeletedIds();

    // 3. Get Static Updates (Hardcoded in constants)
    // Filter out any static update that exists in the deleted list
    const activeStaticUpdates = LEGACY_UPDATE_DATA.filter(u => !deletedIds.includes(u.id));

    // 4. Merge: 
    // We want local updates to override static ones if they share the same ID (Editing a static update)
    // So we filter out static ones that have a local counterpart
    const localIds = localUpdates.map(u => u.id);
    const finalStaticUpdates = activeStaticUpdates.filter(u => !localIds.includes(u.id));

    // Combine: Local (Newest) + Remaining Static
    return [...localUpdates, ...finalStaticUpdates];
  } catch (error) {
    console.error("Error loading updates", error);
    return [];
  }
};

export const saveUpdate = (update: UpdateFeature): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const currentUpdates: UpdateFeature[] = stored ? JSON.parse(stored) : [];
  
  // Add new update to the beginning
  const newUpdates = [update, ...currentUpdates];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdates));
};

export const updateUpdate = (updatedFeature: UpdateFeature): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let currentUpdates: UpdateFeature[] = stored ? JSON.parse(stored) : [];
  
  const index = currentUpdates.findIndex(u => u.id === updatedFeature.id);
  
  if (index !== -1) {
    // Update existing local update
    currentUpdates[index] = updatedFeature;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUpdates));
  } else {
    // If not in local storage (it was a static update being edited), save it as a new local entry
    // This effectively "shadows" the static entry
    saveUpdate(updatedFeature);
  }
};

export const deleteUpdate = (id: string): void => {
  // 1. Remove from Local Storage (if it exists there)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const currentUpdates: UpdateFeature[] = JSON.parse(stored);
    const newUpdates = currentUpdates.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdates));
  }

  // 2. Add to Blocklist (in case it's a static update)
  const deletedIds = getDeletedIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));
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
