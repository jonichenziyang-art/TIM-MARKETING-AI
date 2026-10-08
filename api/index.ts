import express from 'express';
import * as geminiBackend from '../services/geminiService.backend.ts';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const handleGeminiRequest = async (req: express.Request, res: express.Response) => {
  // Extract function name whether the path is /api/gemini/:name, /gemini/:name, or /:name
  const pathParts = req.path.split('/').filter(Boolean);
  const functionName = req.params.functionName || pathParts[pathParts.length - 1] || '';

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
        return res.status(404).json({ error: `Function '${functionName}' not found.` });
    }
    res.json({ result });
  } catch (err: any) {
    console.error(`Error in ${functionName}:`, err?.message || err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
};

app.post('/api/gemini/:functionName', handleGeminiRequest);
app.post('/gemini/:functionName', handleGeminiRequest);
app.post('/:functionName', handleGeminiRequest);
app.post('*', handleGeminiRequest);

export default app;
