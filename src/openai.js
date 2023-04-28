import { Configuration, OpenAIApi } from 'openai'

class OpenAI {
    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OpenAIApi_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
    }

    chat() {}

    transcription() {}
}

export const openai = new OpenAI()