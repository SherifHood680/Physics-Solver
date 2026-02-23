import OpenAI from 'openai';

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // During build time, process.env.GROQ_API_KEY is missing.
    // We return a proxy or handle it gracefully to avoid "Missing credentials" error.
    return {
      chat: {
        completions: {
          create: () => { throw new Error("GROQ_API_KEY is missing. Please set it in your environment variables."); }
        }
      }
    } as unknown as OpenAI;
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};

export const aiClient = getClient();
export const AI_MODEL = 'llama-3.3-70b-versatile';
