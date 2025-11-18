
export enum TagType {
  SYSTEM = 'SISTEMAS',
  ECONOMY = 'ECONOMÍA',
  VEHICLES = 'VEHÍCULOS',
  MAP = 'MAPA',
  JOBS = 'TRABAJOS',
  EVENT = 'EVENTO'
}

// We define the content block type here so it can be saved
export type ContentBlock = 
  | { type: 'header'; content: string; color?: string }
  | { type: 'paragraph'; content: string } 
  | { type: 'image'; src: string };

export interface UpdateFeature {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string; // Main cover image
  secondaryImage?: string; // For the hero background or details
  tag: TagType;
  date: string;
  fullContent: string; // Final HTML for display
  rawBlocks?: ContentBlock[]; // Saved state for the editor to re-load properly
  isFeatured?: boolean;
  version?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
