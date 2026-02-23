const OpenAI = require('openai');

const apiKey = process.env.GROQ_API_KEY;
console.log('API Key present:', !!apiKey);
console.log('Model:', 'llama-3.3-70b-versatile');

const aiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
});

async function test() {
    try {
        const response = await aiClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'user', content: 'Say hello in JSON format' }
            ],
            response_format: { type: 'json_object' }
        });
        console.log('Success:', response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response details:', error.response.data);
        }
    }
}

test();
