import dotenv from 'dotenv';
import OpenAI from 'openai';
import { getModel as getGeminiModel } from './gemini.js';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

// Try to use OpenAI first, fall back to Gemini if not available
let useOpenAI = false;
let openai: OpenAI | null = null;

if (openaiApiKey) {
  try {
    openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    useOpenAI = true;
    console.log('✅ Using OpenAI');
  } catch (error) {
    console.warn('⚠️ Failed to initialize OpenAI, falling back to Gemini');
  }
}

if (!useOpenAI && !geminiApiKey) {
  console.error('❌ ERROR: No AI API key found!');
  console.error('   Please create a backend/.env file with one of the following:');
  console.error('   OPENAI_API_KEY=your_openai_key_here');
  console.error('   OR');
  console.error('   GEMINI_API_KEY=your_gemini_key_here');
  console.error('');
  console.error('   Get OpenAI key: https://platform.openai.com/api-keys');
  console.error('   Get Gemini key: https://makersuite.google.com/app/apikey');
  throw new Error('AI API key is required. Please set OPENAI_API_KEY or GEMINI_API_KEY in backend/.env file.');
}

// Model configuration
export const modelConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  max_tokens: 1024,
};

// Unified model interface
export const getModel = () => {
  if (useOpenAI && openai) {
    return {
      generateContent: async (prompt: string) => {
        const completion = await openai!.chat.completions.create({
          model: modelConfig.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
        });

        return {
          response: {
            text: () => completion.choices[0]?.message?.content || '',
          },
        };
      },
    };
  } else {
    // Fall back to Gemini
    console.log('✅ Using Google Gemini (fallback)');
    return getGeminiModel();
  }
};

export default getModel;

