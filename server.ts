import express from 'express';
import path from 'path';
import * as geminiBackend from './services/geminiService.backend.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Allow larger payload sizes to accommodate base64 image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes (must be declared BEFORE Vite middleware)
  app.post('/api/gemini/:functionName', async (req, res) => {
    const { functionName } = req.params;
    try {
      let result;
      switch (functionName) {
        case 'analyzePerformance':
          result = await geminiBackend.analyzePerformance(req.body.filesData);
          break;
        case 'chatWithAnalyzer':
          result = await geminiBackend.chatWithAnalyzer(req.body.contextData, req.body.userMessage, req.body.chatHistory);
          break;
        case 'generateAestheticProductPhoto':
          result = await geminiBackend.generateAestheticProductPhoto(req.body.data);
          break;
        case 'generateAdImage':
          result = await geminiBackend.generateAdImage(req.body.data);
          break;
        case 'editAdImage':
          result = await geminiBackend.editAdImage(req.body.base64Image, req.body.prompt, req.body.aspectRatio);
          break;
        case 'generateVideoPrompt':
          result = await geminiBackend.generateVideoPrompt(req.body.data);
          break;
        case 'generateAudio':
          result = await geminiBackend.generateAudio(req.body.text, req.body.voiceName);
          break;
        case 'generateCopyVariations':
          result = await geminiBackend.generateCopyVariations(req.body.data);
          break;
        case 'generateLandingPageStructure':
          result = await geminiBackend.generateLandingPageStructure(req.body.data);
          break;
        case 'generateAdStrategy':
          result = await geminiBackend.generateAdStrategy(req.body.data);
          break;
        case 'generateStudioAIContent':
          result = await geminiBackend.generateStudioAIContent(req.body.data, req.body.aspectRatio);
          break;
        case 'studioAIOrchestrator':
          result = await geminiBackend.studioAIOrchestrator(req.body.userInput, req.body.aspectRatio);
          break;
        default:
          return res.status(404).json({ error: `Function ${functionName} not found` });
      }
      res.json({ result });
    } catch (err: any) {
      console.error(`Error in ${functionName}:`, err.message || err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
