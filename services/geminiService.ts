// Client-side Gemini Service Proxy
// Delegates actual model execution to the server backend securely

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createWavFromAudioBuffer(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i, sample, offset = 0, pos = 0;
  
  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);
  
  for(i = 0; i < numOfChan; i++) channels.push(audioBuffer.getChannelData(i));
  while(offset < audioBuffer.length) {
    for(i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
      view.setInt16(pos, sample, true); 
      pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

// Helper to handle POST requests to our proxy backend
async function callProxy(functionName: string, payload: any) {
  const response = await fetch(`/api/gemini/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(err.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export const analyzePerformance = async (filesData: { fileName: string, campaigns: any[] }[]) => {
  const res = await callProxy('analyzePerformance', { filesData });
  return res.result;
};

export const chatWithAnalyzer = async (contextData: any, userMessage: string, chatHistory: {role: string, content: string}[]) => {
  const res = await callProxy('chatWithAnalyzer', { contextData, userMessage, chatHistory });
  return res.result;
};

export const generateAestheticProductPhoto = async (data: any) => {
  const res = await callProxy('generateAestheticProductPhoto', { data });
  return res.result;
};

export const generateAdImage = async (data: any) => {
  const res = await callProxy('generateAdImage', { data });
  return res.result;
};

export const editAdImage = async (base64Image: string, prompt: string, aspectRatio: string) => {
  const res = await callProxy('editAdImage', { base64Image, prompt, aspectRatio });
  return res.result;
};

export const generateVideoPrompt = async (data: any) => {
  const res = await callProxy('generateVideoPrompt', { data });
  return res.result;
};

export const generateAudio = async (text: string, voiceName: string = 'Kore') => {
  const res = await callProxy('generateAudio', { text, voiceName });
  const base64Audio = res.result;
  if (!base64Audio) throw new Error("No audio data received from server");
  
  const audioBytes = decode(base64Audio);
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const buffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
  const wavBlob = createWavFromAudioBuffer(buffer);
  return URL.createObjectURL(wavBlob);
};

export const generateCopyVariations = async (data: any) => {
  const res = await callProxy('generateCopyVariations', { data });
  return res.result;
};

export const generateLandingPageStructure = async (data: any) => {
  const res = await callProxy('generateLandingPageStructure', { data });
  return res.result;
};

export const generateAdStrategy = async (data: any) => {
  const res = await callProxy('generateAdStrategy', { data });
  return res.result;
};

export const generateStudioAIContent = async (data: any, aspectRatio: string = '1:1') => {
  const res = await callProxy('generateStudioAIContent', { data, aspectRatio });
  return res.result;
};

export const studioAIOrchestrator = async (userInput: string, aspectRatio: string = '1:1') => {
  const res = await callProxy('studioAIOrchestrator', { userInput, aspectRatio });
  return res.result;
};
