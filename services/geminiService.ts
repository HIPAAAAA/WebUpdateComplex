import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize the client.
// NOTE: In a real production build, ensure API_KEY is set in your environment variables.
// The app will fail gracefully if the key is missing.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string
): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key no configurada. Por favor configura process.env.API_KEY.";
  }

  try {
    // Construct a prompt that includes history context manually for this simple stateless request
    // or use the chat feature. Here we use the chat feature for better context management.
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({
        message: newMessage
    });

    return result.text || "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un error al conectar con el sistema de inteligencia de Legacy. Inténtalo de nuevo más tarde.";
  }
};