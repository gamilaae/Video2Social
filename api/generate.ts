import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel serverless function configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // We accept 'contents' instead of just 'prompt' to support your existing video/image payload structure
    const { contents, systemInstruction } = req.body;

    if (!contents) {
      return res.status(400).json({ error: 'Missing contents in request body' });
    }

    // Initialize the SDK using the environment variable
    
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.GEMINI_API_KEY
});    

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    // Return the generated text
    return res.status(200).json({ text: response.text });
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error' 
    });
  }
}