export enum TagType {
  SYSTEM = 'SISTEMAS',
  ECONOMY = 'ECONOMÍA',
  VEHICLES = 'VEHÍCULOS',
  MAP = 'MAPA',
  JOBS = 'TRABAJOS',
  EVENT = 'EVENTO'
}

export interface UpdateFeature {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string; // Main cover image
  secondaryImage?: string; // For the hero background or details
  tag: TagType;
  date: string;
  fullContent: string; // Supports HTML-like string for this demo
  isFeatured?: boolean;
  version?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}