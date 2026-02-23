import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;

export const aiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1', // Groq's OpenAI-compatible endpoint
});

export const AI_MODEL = 'llama-3.3-70b-versatile'; // High-quality, fast model
