import { getModel as getGeminiModel } from './gemini.js';

// Unified AI interface - supports both OpenAI and Gemini
// Currently using Gemini (can be extended to support OpenAI)

export const getModel = () => {
  // For now, just use Gemini
  // In the future, can add OpenAI support with automatic fallback
  return getGeminiModel();
};

export default { getModel };
