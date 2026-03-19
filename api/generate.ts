import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Extend the maximum duration for Vercel (Hobby plan max is 10s or 60s depending on settings)
export const config = {
  maxDuration: 60, 
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
      apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY 
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