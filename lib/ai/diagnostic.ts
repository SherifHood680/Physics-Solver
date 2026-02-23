import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyB4agNyKh3F5W37i3N8ZP2cCNOXMtFAO_8';

async function listModels() {
    // The GoogleGenerativeAI instance is no longer needed for listing models via raw fetch,
    // as the API key is directly used in the fetch URL.
    // If other operations using genAI were present, this line would remain.
    // const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('Fetching models for key:', apiKey.substring(0, 10) + '...');
        // The library doesn't have a direct listModels, we use the raw API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching models:', data);
            return;
        }

        console.log('Available Models:');
        data.models?.forEach((m: any) => console.log(`- ${m.name} (${m.displayName})`));
    } catch (error) {
        console.error('Failed to list models:', error);
    }
}

listModels();
