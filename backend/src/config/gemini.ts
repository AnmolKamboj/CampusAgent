import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in environment variables.');
  console.error('   Please create a backend/.env file with: GEMINI_API_KEY=your_key_here');
  console.error('   Get your API key from: https://makersuite.google.com/app/apikey');
  throw new Error('GEMINI_API_KEY is required. Please set it in backend/.env file.');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Model configuration
export const modelConfig = {
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
};

export const getModel = () => {
  const model = genAI.getGenerativeModel(modelConfig);
  return {
    generateContent: async (prompt: string) => {
      const result = await model.generateContent(prompt);
      return {
        response: {
          text: () => result.response.text(),
        },
      };
    },
  };
};

