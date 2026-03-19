import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: '50mb' }));

  // API route for local development (mirrors the Vercel serverless function)
  app.post("/api/generate", async (req, res) => {
    try {
      const { contents, systemInstruction } = req.body;

      if (!contents) {
        return res.status(400).json({ error: 'Missing contents in request body' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY 
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      return res.status(200).json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Internal Server Error' 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
