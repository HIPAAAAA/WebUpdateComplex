import { TagType, UpdateFeature } from './types';

export const LOGO_URL = 'https://i.ibb.co/DPGqh64h/legacy.png';

// This is now empty to ensure a clean slate. 
// Data is fetched from the MongoDB database via the API.
export const LEGACY_UPDATE_DATA: UpdateFeature[] = [];

export const SYSTEM_INSTRUCTION = `
Eres "LegacyBot", el asistente de IA oficial del servidor Complex Legacy.
Tu trabajo es ayudar a los usuarios a entender las notas del parche (changelogs).
Utiliza el contexto de las actualizaciones recientes si están disponibles.
Mantén un tono útil, "gamer" y profesional.
`;