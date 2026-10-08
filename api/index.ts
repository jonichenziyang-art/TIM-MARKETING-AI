import * as geminiBackend from '../services/geminiService.backend.ts';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  const sendJson = (statusCode: number, data: any) => {
    if (typeof res.status === 'function') {
      const chained = res.status(statusCode);
      if (chained && typeof chained.json === 'function') {
        return chained.json(data);
      }
    }
    if (typeof res.json === 'function') {
      if (res.statusCode !== undefined) res.statusCode = statusCode;
      return res.json(data);
    }
    res.statusCode = statusCode;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.end === 'function') {
      return res.end(JSON.stringify(data));
    }
  };

  try {
    // Safely retrieve or parse body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body && typeof req.on === 'function') {
      // If streaming in Node environment without body-parser
      const buffers: any[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const dataStr = Buffer.concat(buffers).toString();
      try {
        body = JSON.parse(dataStr);
      } catch {
        body = {};
      }
    }
    body = body || {};

    // Determine target API function name
    const urlPath = (req.url || '').split('?')[0];
    const pathParts = urlPath.split('/').filter(Boolean);
    let functionName = body.functionName || req.query?.functionName || '';
    
    if (!functionName) {
      const lastPart = pathParts[pathParts.length - 1] || '';
      if (lastPart === 'index' || lastPart === 'index.ts') {
        functionName = pathParts[pathParts.length - 2] || '';
      } else {
        functionName = lastPart;
      }
    }

    if (!functionName) {
      return sendJson(400, { error: 'Nama fungsi API (functionName) tidak ditemukan.' });
    }

    let result;
    switch (functionName) {
      case 'analyzePerformance':
        result = await geminiBackend.analyzePerformance(body.filesData || []);
        break;
      case 'chatWithAnalyzer':
        result = await geminiBackend.chatWithAnalyzer(body.contextData, body.userMessage || '', body.chatHistory || []);
        break;
      case 'generateAestheticProductPhoto':
        result = await geminiBackend.generateAestheticProductPhoto(body.data || {});
        break;
      case 'generateAdImage':
        result = await geminiBackend.generateAdImage(body.data || {});
        break;
      case 'editAdImage':
        result = await geminiBackend.editAdImage(body.base64Image || '', body.prompt || '', body.aspectRatio || '1:1');
        break;
      case 'generateVideoPrompt':
        result = await geminiBackend.generateVideoPrompt(body.data || {});
        break;
      case 'generateAudio':
        result = await geminiBackend.generateAudio(body.text || '', body.voiceName || 'Kore');
        break;
      case 'generateCopyVariations':
        result = await geminiBackend.generateCopyVariations(body.data || {});
        break;
      case 'generateLandingPageStructure':
        result = await geminiBackend.generateLandingPageStructure(body.data || {});
        break;
      case 'generateAdStrategy':
        result = await geminiBackend.generateAdStrategy(body.data || {});
        break;
      case 'generateStudioAIContent':
        result = await geminiBackend.generateStudioAIContent(body.data || {}, body.aspectRatio || '1:1');
        break;
      case 'studioAIOrchestrator':
        result = await geminiBackend.studioAIOrchestrator(body.userInput || '', body.aspectRatio || '1:1');
        break;
      default:
        return sendJson(404, { error: `Fungsi API '${functionName}' tidak ditemukan.` });
    }

    return sendJson(200, { result });
  } catch (err: any) {
    console.error('API Error in /api:', err?.message || err);
    return sendJson(500, { error: err?.message || 'Internal server error' });
  }
}
