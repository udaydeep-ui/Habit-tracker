import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to parse workout plan images or documents using Gemini 3.8 Flash
app.post('/api/gemini/parse-plan', async (req, res) => {
  try {
    const { imageBase64, imageMimeType = 'image/png', imagePath } = req.body;

    let base64Data = imageBase64;
    let mimeType = imageMimeType;

    // If an imagePath is provided (like /public/assets/aistudio/rei-9-day-plan_1600265b.png)
    if (!base64Data && imagePath) {
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const fullPath = path.resolve(__dirname, cleanPath);
      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        base64Data = fileBuffer.toString('base64');
        if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (cleanPath.endsWith('.webp')) {
          mimeType = 'image/webp';
        } else {
          mimeType = 'image/png';
        }
      }
    }

    if (!base64Data) {
      return res.status(400).json({
        error: 'No image data provided. Send imageBase64 or imagePath.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return helpful fallback signal so client can use high-accuracy built-in 9-day plan schema
      return res.status(200).json({
        isFallback: true,
        message: 'GEMINI_API_KEY not configured. Using pre-extracted 9-day plan blueprint.',
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptText = `Analyze this workout/fitness/habit routine image carefully.
Extract every day in the cycle, the title, instructions, intensity/type ("easy", "hard", "rest", "long_run"), warm-up drills, breathing rules, rules, and medical warnings.
Return a structured JSON following the required schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, { text: promptText }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Title of the plan (e.g. 9-Day Running + Gym Plan)' },
            subtitle: { type: Type.STRING, description: 'Subtitle or cycle description' },
            cycleLength: { type: Type.INTEGER, description: 'Number of days in the cycle, e.g. 9' },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'Must be one of: easy, hard, rest, long_run' },
                  runningInstructions: { type: Type.STRING },
                  gymFocus: { type: Type.STRING },
                  hasWarmup: { type: Type.BOOLEAN },
                  progressionRule: { type: Type.STRING, description: 'Any loop progression rule noted, e.g. add 1 burst, add 5 min' },
                  estimatedBurn: { type: Type.INTEGER, description: 'Rough estimated calories burned' },
                  targetDurationMin: { type: Type.INTEGER, description: 'Estimated target duration in minutes' },
                },
                required: ['dayNumber', 'title', 'type', 'runningInstructions'],
              },
            },
            warmupDrills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Warm-up steps or drills',
            },
            breathingRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Breathing cues and instructions',
            },
            rules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Core rules or guidelines',
            },
            medicalAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Warnings, e.g. see a doctor if...',
            },
          },
          required: ['name', 'cycleLength', 'days'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Gemini parse plan error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse image with Gemini',
    });
  }
});

// Endpoint to generate AI progression coaching advice
app.post('/api/gemini/coach-advice', async (req, res) => {
  try {
    const { loopNumber, dayNumber, currentPace, rpe, statusCounts, notes } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        advice: `For Loop ${loopNumber || 1}, maintain the target speed (max 7 km/h on Day 6) and ensure you strictly take the 2 min walks between bursts. Great consistency!`,
      });
    }

    const prompt = `As an elite strength & running endurance coach for the 9-Day Running + Gym cycle:
Current status:
- Loop: ${loopNumber || 1}
- Day: ${dayNumber || 1}
- Logged RPE: ${rpe || 6}/10
- Logged pace/speed: ${currentPace || 'standard'}
- Completed/Failed/Postponed status: ${JSON.stringify(statusCounts || {})}
- User notes: ${notes || 'none'}

Give 2-3 concise, high-impact athletic coaching recommendations for the next session. Emphasize breathing technique, recovery, and pacing. Keep it under 100 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ advice: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error generating coach advice' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
