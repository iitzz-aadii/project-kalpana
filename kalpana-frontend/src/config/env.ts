// src/config/env.ts

export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Fallback for development - you should set VITE_GEMINI_API_KEY in your .env file
  get isGeminiConfigured() {
    return this.geminiApiKey && this.geminiApiKey !== '';
  }
};
