import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

// Model configuration
export const modelConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  max_tokens: 1024,
};

// Helper function to get a chat completion (similar interface to Gemini)
export const getModel = () => {
  return {
    generateContent: async (prompt: string) => {
      const completion = await openai.chat.completions.create({
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
};

