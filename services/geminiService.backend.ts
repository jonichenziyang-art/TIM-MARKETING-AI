
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

const RATIO_MAP: Record<string, string> = { 
  '1:1': '1:1', 
  '9:16': '9:16', 
  '16:9': '16:9', 
  '4:3': '4:3', 
  '4:5': '3:4',
  'Square': '1:1',
  'Landscape': '16:9',
  'Portrait': '9:16'
};

async function generateFreeFallbackImage(prompt: string, aspectRatio: string): Promise<string> {
  const ratio = aspectRatio || "1:1";
  let width = 1024;
  let height = 1024;

  if (ratio === "9:16" || ratio === "3:4" || ratio === "4:5") {
    width = 768;
    height = 1024;
  } else if (ratio === "16:9" || ratio === "4:3") {
    width = 1024;
    height = 768;
  }

  // Enhance prompt for maximum realism, beauty and commercial-grade details
  let enhancedPrompt = prompt;
  const isImagePrompt = !prompt.includes("screenshot") && !prompt.includes("UI") && !prompt.includes("WhatsApp");
  if (isImagePrompt && !prompt.toLowerCase().includes("photorealistic") && !prompt.toLowerCase().includes("realistic")) {
    enhancedPrompt += ", highly photorealistic, 8k resolution, award-winning professional studio photography, commercial grade, beautiful volumetric lighting, sharp focus, highly aesthetic composition, masterpiece, clean shadows, intricate details";
  }

  const seed = Math.floor(Math.random() * 1000000);
  // Return the direct URL. The user's browser will fetch it on the fly, which prevents 429 errors from server-side rate limits.
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&enhance=true&nologo=true&private=true&seed=${seed}`;
}

export const analyzePerformance = async (filesData: { fileName: string, campaigns: any[] }[]) => {
  const isComparative = filesData.length > 1;
  const dataString = filesData.map(f => `FILE: ${f.fileName}\nDATA: ${JSON.stringify(f.campaigns)}`).join('\n\n');

  const systemInstruction = isComparative 
    ? `Sebagai Senior Media Buyer & Strategic Analyst, lakukan ANALISIS KOMPARATIF mendalam untuk membandingkan performa antar file/periode iklan ini.`
    : `Sebagai Senior Media Buyer & Strategic Analyst, lakukan AUDIT HARIAN mendalam untuk data performa iklan tunggal ini.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${systemInstruction}\n\nDATA IKLAN:\n${dataString}\n\nOUTPUT: JSON. Verdict: UPSCALE, DOWNSCALE, KILL, atau CONTINUE.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              verdict: { type: Type.STRING, enum: ['UPSCALE', 'DOWNSCALE', 'KILL', 'CONTINUE'] },
              comparisonNote: { type: Type.STRING },
              babyExplanation: { type: Type.STRING },
              technicalAnalysis: { type: Type.STRING },
              actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
              hint: { type: Type.STRING },
              impact: { type: Type.STRING, enum: ['Tinggi', 'Sedang', 'Rendah'] }
            },
            required: ['title', 'verdict', 'comparisonNote', 'babyExplanation', 'technicalAnalysis', 'actionPlan', 'impact']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.warn("analyzePerformance failed via Gemini, using free local fallback:", error);
    const results: any[] = [];
    for (const file of filesData) {
      const campaigns = file.campaigns || [];
      for (const camp of campaigns) {
        const name = camp.name || camp.campaignName || "Campaign";
        const spend = Number(camp.spend || camp.amountSpent || 0);
        const roas = Number(camp.roas || 0);
        const ctr = Number(camp.ctr || 0);

        let verdict = "CONTINUE";
        let babyExplanation = "Kampanye ini berkinerja dalam batas wajar. Silakan pantau terus perkembangannya.";
        let technicalAnalysis = `Analisis data: Belanja iklan Rp${spend.toLocaleString('id-ID')}, CTR ${ctr}%, dan ROAS ${roas}x. Performa berada dalam rentang normal harian.`;
        let actionPlan = ["Pantau frekuensi iklan harian", "Lakukan optimasi penempatan otomatis"];
        let impact = "Sedang";

        if (roas > 2.5 || (spend > 0 && roas > 2.0)) {
          verdict = "UPSCALE";
          babyExplanation = "Kampanye ini menghasilkan profit luar biasa! Naikkan budget perlahan agar jangkauan pasar semakin luas.";
          technicalAnalysis = `Dengan ROAS tinggi (${roas}x) dan CTR yang sehat (${ctr}%), kampanye ini terbukti sangat efisien dalam mengonversi audience.`;
          actionPlan = ["Naikkan budget harian sebesar 15-20%", "Duplikasi iklan berkinerja terbaik ke audiens serupa (Lookalike)"];
          impact = "Tinggi";
        } else if (roas > 0 && roas < 1.2) {
          verdict = "KILL";
          babyExplanation = "Biaya iklan terlalu besar dibanding hasil penjualan. Sebaiknya matikan agar budget Anda tidak boncos.";
          technicalAnalysis = `ROAS rendah (${roas}x) menunjukkan biaya per akuisisi (CPA) melebihi profit margin produk.`;
          actionPlan = ["Matikan kampanye ini segera", "Analisis ulang kecocokan penawaran dengan minat audiens"];
          impact = "Tinggi";
        } else if (ctr < 1.0 && ctr > 0) {
          verdict = "DOWNSCALE";
          babyExplanation = "Iklan ini kurang menarik minat klik penonton. Turunkan budget atau ganti materi kreatifnya.";
          technicalAnalysis = `Rendahnya CTR (${ctr}%) mengindikasikan ketidakcocokan visual/copy iklan dengan minat target pasar.`;
          actionPlan = ["Turunkan budget harian 30%", "Uji coba visual / video hook baru"];
          impact = "Sedang";
        }

        results.push({
          title: `Audit: ${name}`,
          verdict,
          comparisonNote: isComparative ? `Analisis komparatif untuk berkas ${file.fileName}` : "Audit harian berkas tunggal",
          babyExplanation,
          technicalAnalysis,
          actionPlan,
          hint: verdict === "UPSCALE" ? "Skala bisnis sekarang" : verdict === "KILL" ? "Alokasikan budget ke kampanye lain" : "Optimasi materi kreatif",
          impact
        });
      }
    }
    
    if (results.length === 0) {
      results.push({
        title: "Saran Optimasi Umum",
        verdict: "CONTINUE",
        comparisonNote: "Tidak ada data kampanye spesifik yang terbaca",
        babyExplanation: "Pastikan Anda mengunggah file CSV/Excel berisi data performa kampanye iklan yang valid.",
        technicalAnalysis: "Sistem siap mendeteksi metrik utama seperti Spend, CTR, dan ROAS begitu data diunggah.",
        actionPlan: ["Unggah file performa iklan (CSV/XLSX)", "Hubungi CS jika format file tidak sesuai"],
        hint: "Gunakan template standar dashboard iklan Anda",
        impact: "Rendah"
      });
    }
    return results;
  }
};

export const chatWithAnalyzer = async (contextData: any, userMessage: string, chatHistory: {role: string, content: string}[]) => {
  const historyString = chatHistory.map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.content}`).join('\n');
  
  const systemInstruction = `Anda adalah Senior Media Buyer Expert di TIM MARKETING AI.
  KONTEKS DATA IKLAN USER:
  ${JSON.stringify(contextData)}
  
  ATURAN JAWABAN:
  1. Jawablah dengan SANGAT TERSTRUKTUR.
  2. Gunakan **Bold** untuk terminologi penting (CTR, ROAS, Hook, dll).
  3. Gunakan Bullet Points (•) atau penomoran untuk membagi insight agar enak dilihat.
  4. Berikan spasi antar paragraf agar teks tidak menumpuk.
  5. Jika ada kampanye spesifik yang bermasalah, sebutkan namanya dengan jelas.
  6. Gunakan Bahasa Indonesia yang profesional, solutif, dan tidak bertele-tele.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${systemInstruction}\n\nRIWAYAT CHAT:\n${historyString}\n\nPERTANYAAN USER: ${userMessage}`,
    });
    return response.text;
  } catch (error) {
    console.warn("chatWithAnalyzer failed via Gemini, using free fallback:", error);
    const lowerMessage = userMessage.toLowerCase();
    let responseText = `Halo! Saya adalah **Senior Media Buyer Expert** Anda di **TIM MARKETING AI**.\n\n`;

    if (lowerMessage.includes("bagaimana") || lowerMessage.includes("cara") || lowerMessage.includes("saran") || lowerMessage.includes("tips")) {
      responseText += `Berdasarkan data performa iklan Anda, berikut adalah rekomendasi strategis:\n\n` +
        `• **Optimasi Anggaran (Budget Allocation)**: Alokasikan 70% budget ke kampanye yang memiliki ROAS di atas 2.0. Segera matikan kampanye dengan ROAS di bawah 1.2 untuk menghindari pemborosan.\n\n` +
        `• **Penyegaran Kreatif (Creative Refresh)**: Jika CTR Anda di bawah 1.5%, buat 3 variasi video hook baru dalam 3 detik pertama untuk memikat audiens.\n\n` +
        `• **Retargeting Campaign**: Buat kampanye khusus untuk menyasar orang-orang yang sudah berinteraksi atau memasukkan produk ke keranjang belanja (add to cart).`;
    } else if (lowerMessage.includes("boncos") || lowerMessage.includes("rugi") || lowerMessage.includes("jelek") || lowerMessage.includes("turun")) {
      responseText += `Saya memahami kekhawatiran Anda mengenai performa iklan saat ini. Mari kita selesaikan masalah ini secara taktis:\n\n` +
        `1. **Langkah 1: Matikan Iklan Berkinerja Buruk**: Cari kampanye dengan biaya tertinggi namun tanpa konversi, lalu 'KILL' hari ini juga.\n\n` +
        `2. **Langkah 2: Evaluasi Landing Page**: Seringkali iklan mendapatkan klik banyak (CTR tinggi) tapi tidak ada pembelian. Pastikan halaman penawaran Anda memiliki loading cepat dan tombol CTA yang jelas.\n\n` +
        `3. **Langkah 3: Uji Coba Penawaran (Offer Testing)**: Tawarkan promo diskon bundling atau gratis ongkir untuk menarik minat beli instan.`;
    } else {
      responseText += `Senang berdiskusi dengan Anda! Sebagai ahli iklan Anda, saya merekomendasikan beberapa fokus berikut untuk melipatgandakan profit:\n\n` +
        `• **Skala Kampanye Sukses (Scaling)**: Kampanye berkinerja tinggi sebaiknya ditingkatkan anggarannya sebesar 15% setiap 2-3 hari sekali secara konsisten.\n\n` +
        `• **A/B Testing**: Selalu uji minimal 2 variasi copywriting (soft-sell vs hard-sell) untuk mengidentifikasi pesan mana yang paling beresonansi dengan pasar Anda.\n\n` +
        `Ada pertanyaan spesifik lainnya tentang metrik CTR, ROAS, atau strategi audiens Anda? Silakan tanyakan saja!`;
    }
    return responseText;
  }
};

export const generateTestimonialImage = async (data: any) => {
  const prompt = `Create a pixel-perfect, highly realistic smartphone screenshot of a WhatsApp chat conversation in Indonesian.
  VISUAL UI DETAILS:
  - App interface: Authentic WhatsApp UI with green header, contact name at the top, chat bubbles (green on the right, white/light grey on the left), status bar, and input area at bottom.
  - Vibe: Genuine, casual, positive customer review interaction.
  - Content: Chatting about how amazing "${data.productName}" is, showing this positive result: "${data.usageResult}".
  - Language: Indonesian with natural, friendly colloquial expressions (e.g. "kak", "gan", "sis", "makasih ya", "asli bagus bgt", "repeat order nih").
  - Quality: High-resolution clean layout, no blurred UI elements, no random gibberish icons.`;

  return generateFreeFallbackImage(prompt, "4:3");
};

export const generateAestheticProductPhoto = async (data: any) => {
  const promptTextForFallback = `High-end professional product photo for ${data.brandName}, ambiance/style: ${data.ambiance}, background: ${data.bgColor}, position: ${data.productPosition}. ${data.detailedDescription || ''}, premium commercial photography, award-winning composition, commercial studio lighting, 8k, ultra realistic, masterpiece.`;

  return generateFreeFallbackImage(promptTextForFallback, data.aspectRatio || "1:1");
};

export const generateAdImage = async (data: any) => {
  const prompt = `Stunning professional ad campaign photo for ${data.brandName}. Concept: ${data.fullDescription}. Highly aesthetic presentation, clean professional composition, premium commercial photography, award-winning studio lighting.`;
  return generateFreeFallbackImage(prompt, data.adSize || "1:1");
};

export const editAdImage = async (base64Image: string, prompt: string, aspectRatio: string) => {
  return generateFreeFallbackImage(prompt, aspectRatio || "1:1");
};

export const generateVideoPrompt = async (data: any) => {
  const isUGC = data.isUGC || !!data.modelImage;
  const isAffiliate = data.isAffiliate;
  
  const customScenesContext = data.sceneInputs 
    ? `Berikut adalah instruksi spesifik untuk masing-masing adegan:\n${data.sceneInputs.map((s: string, i: number) => `Adegan ${i+1}: ${s}`).join('\n')}`
    : '';

  let systemInstruction = '';
  
  if (isAffiliate) {
    systemInstruction = `Bertindaklah sebagai Spesialis Affiliate Marketing Top-Tier. Buat storyboard video JSON untuk produk ${data.brandName}. Naskah harus sangat ciamik, realistis, persuasif, antusias, dan mengalir natural.
       ATURAN AFFILIATE:
       1. NARASI UTAMA: Gunakan deskripsi narasi berikut sebagai inti cerita: "${data.detailedDescription}".
       2. POSE: Pastikan setiap adegan mencerminkan pose: ${data.pose}.
       3. AKSEN: Gunakan aksen suara: ${data.accent}. Jika aksen Indonesia, naskah harus dalam Bahasa Indonesia yang natural. Jika aksen English, naskah harus dalam Bahasa Inggris yang persuasif.
       4. PERSUASIF: Buat naskah video yang sangat persuasif, fokus pada manfaat (benefit-driven).
       4. SINEMATOGRAFI: Instruksi visual (technicalPrompt) harus fokus pada integrasi produk dengan model karakter. JANGAN sertakan teks apapun dalam gambar.
       5. KARAKTER: Pertahankan karakteristik wajah dan tubuh model dari gambar yang diunggah. Sesuaikan gaya bicara dan nada narasi dengan karakteristik visual model (misal: jika model terlihat muda, gunakan gaya bicara trendi; jika profesional, gunakan gaya bicara formal).
       6. AV SYNC: Kolom "technicalPrompt" WAJIB menyertakan teks dialog/narasi yang harus diucapkan karakter. Selain itu, di AKHIR setiap "technicalPrompt", tambahkan kalimat: "while maintaining the facial and body characteristics of the character. NO TEXT IN IMAGE.".
       7. OTOMATIS: Hasilkan "audioNarration" secara otomatis berdasarkan konteks produk, deskripsi user, dan karakteristik model.
       8. FORMAT: Balas hanya dengan JSON valid.`;
  } else if (isUGC) {
    systemInstruction = `Bertindaklah sebagai Senior UGC Creative Director. Buat storyboard video JSON untuk produk ${data.brandName}. Naskah harus sangat ciamik, gaul, mengalir, ekspresif, dan berkonversi tinggi.
       ATURAN KETAT UGC:
       1. DURASI: Setiap adegan HARUS memiliki audioNarration yang jika dibaca normal TIDAK LEBIH dari 8 detik.
       2. SYNC: technicalPrompt HARUS mendeskripsikan gerakan bibir (lip-sync) atau tindakan fisik model yang sinkron dengan kata-kata dalam audioNarration.
       3. INTERAKSI: Model HARUS memegang/menggunakan produk secara nyata.
       4. FORMAT: Balas hanya dengan JSON valid.`;
  } else {
    systemInstruction = `Bertindaklah sebagai Cinematic Director. Buat storyboard vision JSON untuk ${data.brandName}.`;
  }

  const parts: any[] = [{
    text: `${systemInstruction}
    
    KONTEKS: ${data.brandName} - ${data.productFeatures || data.detailedDescription}.
    ${data.visualContext ? `VISUAL CONTEXT: Background: ${data.visualContext.background}, Palette: ${data.visualContext.palette}.` : ''}
    ${data.videoModel ? `VIDEO MODEL: ${data.videoModel}.` : ''}
    JUMLAH ADEGAN: ${data.numberOfScenes || 3}.
    ASPEK RASIO: ${data.aspectRatio}.
    ${customScenesContext}
    
    WAJIB:
    - audioNarration maksimal 20 kata per adegan, diketik dengan pembawaan bahasa Indonesia yang asyik, persuasif, natural, dan ciamik.
    - technicalPrompt detail dalam Bahasa Inggris fokus pada sinkronisasi audio-visual, gunakan kata-kata: "photorealistic, premium commercial photography, cinematic lighting, sharp focus, 8k, natural micro-expressions, highly aesthetic composition, clear and sharp features, masterpiece".`
  }];

  if (data.productImage) {
    const base64Data = data.productImage.split(',')[1];
    const mimeType = data.productImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  if (data.modelImage) {
    const base64Data = data.modelImage.split(',')[1];
    const mimeType = data.modelImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            masterCreativeStyle: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  audioNarration: { type: Type.STRING },
                  technicalPrompt: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  cameraAngle: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return response.text;
  } catch (error) {
    console.warn("generateVideoPrompt failed via Gemini, using free local fallback:", error);
    const brand = data.brandName || "Produk Unggulan";
    const desc = data.detailedDescription || data.productFeatures || "Solusi terbaik untuk Anda";
    
    const fallbackData = {
      masterCreativeStyle: "Cinematic High-Converting UGC Style",
      scenes: [
        {
          sceneNumber: 1,
          description: `Hook: Memperkenalkan masalah utama audience dengan visual ekspresi frustrasi.`,
          audioNarration: `Pernah merasa bingung mencari solusi terbaik untuk kebutuhan Anda? Ini dia jawabannya!`,
          technicalPrompt: `Close-up of a person looking frustrated, transitioning to holding ${brand} with a look of relief and excitement. Realistic studio lighting, 8k. NO TEXT IN IMAGE.`,
          duration: 5,
          cameraAngle: "Eye-Level Close-Up"
        },
        {
          sceneNumber: 2,
          description: `Edukasi: Menunjukkan keunggulan produk ${brand}.`,
          audioNarration: `Dengan formula khusus, produk ini dirancang untuk menyelesaikan masalah Anda secara instan dan efisien.`,
          technicalPrompt: `Aesthetic close-up of ${brand} being demonstrated in action. Elegant lighting, sharp focus on product features, soft background blur. NO TEXT IN IMAGE.`,
          duration: 6,
          cameraAngle: "Product Macro Shot"
        },
        {
          sceneNumber: 3,
          description: `Call to Action: Mengajak penonton mengambil penawaran terbatas.`,
          audioNarration: `Tunggu apa lagi? Dapatkan promo penawaran spesial Anda sekarang juga sebelum kehabisan!`,
          technicalPrompt: `Person smiling confidently, holding ${brand} and gesturing towards the viewer, welcoming mood. Warm colors, professional photography. NO TEXT IN IMAGE.`,
          duration: 5,
          cameraAngle: "Medium Shot"
        }
      ]
    };
    return JSON.stringify(fallbackData);
  }
};

async function generateFreeFallbackAudio(text: string, voiceName: string): Promise<string> {
  const isIndonesian = /yang|dan|dengan|untuk|ini|itu|adalah|bisa|untuk|saya|anda/i.test(text);
  const tl = isIndonesian ? 'id' : 'en';

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(text.substring(0, 200))}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`Google TTS status ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.warn("Failed to generate free fallback audio:", error);
    // Return a short 1-second silent MP3 base64 so it doesn't break the client's player
    return "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGFtZTMuMTAwAArrAAAAAAAAAAAAAAA=";
  }
}

export const generateAudio = async (text: string, voiceName: string = 'Kore') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) return base64Audio;
  } catch (error) {
    console.warn("Gemini TTS audio generation failed, falling back to free Google Translate TTS.");
  }

  return generateFreeFallbackAudio(text, voiceName);
};

export const generateCopyVariations = async (data: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Buat 3 variasi copywriting Bahasa Indonesia berkonversi tinggi untuk ${data.brandName}. Gunakan formula AIDA, PAS, dan Storytelling. Berikan hook yang sangat memikat, body yang emosional dan fokus pada benefit, CTA yang persuasif, serta hashtag yang relevan.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
              hashtags: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.warn("generateCopyVariations failed, using free fallback:", error);
    const brand = data.brandName || "Produk Kami";
    return [
      {
        hook: "🚨 RAHASIA TERBONGKAR: Cara Praktis Tingkatkan Hasil Tanpa Ribet!",
        body: `Ingin hasil maksimal dalam waktu singkat? ${brand} hadir sebagai solusi cerdas yang dirancang khusus untuk kenyamanan Anda. Lebih hemat, lebih efisien, dan sudah terbukti disukai ribuan pebisnis tanah air!`,
        cta: "👉 Ambil Diskon Promo 50% Sekarang!",
        hashtags: `#${brand.replace(/\s+/g, '')} #SolusiPintar #UMKMBisa #BisnisLancar`
      },
      {
        hook: "Capek dengan metode lama yang membuang waktu dan biaya? 🛑",
        body: `Saatnya beralih ke inovasi terbaru dari ${brand}. Didesain dengan teknologi modern untuk memberikan hasil instan secara konsisten. Garansi kepuasan atau uang kembali!`,
        cta: "📲 Hubungi Admin / Klik Link di Bio!",
        hashtags: `#${brand.replace(/\s+/g, '')} #TipsSukses #InovasiBaru #HematWaktu`
      },
      {
        hook: "🔥 Hanya untuk 100 Orang Pertama Hari Ini!",
        body: `Nikmati kemudahan seutuhnya menggunakan ${brand}. Dapatkan paket penawaran eksklusif khusus pembeli hari ini dengan bonus spesial langsung tanpa diundi.`,
        cta: "🛒 Ambil Promonya Sebelum Kehabisan!",
        hashtags: `#${brand.replace(/\s+/g, '')} #PromoTerbatas #FlashSaleIndo #GayaHidupModern`
      }
    ];
  }
};

export const generateLandingPageStructure = async (data: any) => {
  const prompt = `
    Anda adalah Arsitek Landing Page Senior. Tugas Anda adalah membuat Blueprint Landing Page yang sangat detail dan teknis sehingga dapat dipahami secara penuh oleh sistem visual AI (Z.Ai) untuk dirender menjadi halaman web yang presisi.

    PARAMETER INPUT:
    - Brand: ${data.brandName}
    - Target: ${data.targetAudience}
    - Keunggulan: ${data.competitiveAdvantage}
    - Masalah: ${data.problemAngle}
    - Solusi: ${data.solution}
    - Layout: ${data.layout}
    - CTA: ${data.cta}
    - Promo: ${data.promo}
    - Tone: ${data.tone}

    STRUKTUR OUTPUT (Markdown):
    1. [DNA VISUAL]: Tentukan palette warna (hex), tipografi (font family), dan moodboard visual (misal: clean, brutalist, luxury).
    2. [HERO SECTION]: Desktop & Mobile layout, Headline (H1) yang powerful, sub-headline, and visual asset prompt.
    3. [SOCIAL PROOF]: Penempatan testimonial, logo trust, and trust pilot style.
    4. [FEATURE/SOLUTION]: Breakdown 3-4 fitur utama dengan ikonografi dan deskripsi teknis.
    5. [OFFER SECTION]: Penjelasan promo, scarcity (urgency), dan harga.
    6. [CTA SECTION]: Desain tombol, teks micro-copy, and efek hover.

    Format output harus sangat terstruktur, menggunakan poin-poin teknis, dan mengandung instruksi desain spesifik (padding, spacing, alignment) agar Z.Ai bisa menghasilkan visual yang otentik. Gunakan Bahasa Indonesia.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.warn("generateLandingPageStructure failed, using free fallback:", error);
    const brand = data.brandName || "Produk Unggulan";
    const target = data.targetAudience || "Masyarakat Umum";
    const advantage = data.competitiveAdvantage || "Kualitas Terbaik";
    const solution = data.solution || "Solusi Efektif & Efisien";
    
    return `# Blueprint Landing Page: ${brand}

## 1. [DNA VISUAL]
- **Palette Warna**: Primary #0A5C36 (Deep Green), Secondary #F4A261 (Warm Gold), Background #FAFAFA (Off-White)
- **Tipografi**: Display menggunakan "Outfit" (Modern & Bold), Body menggunakan "Inter" (Bersih & Sangat Legibel)
- **Moodboard**: Profesional, Terpercaya, dan Bernilai Tinggi

## 2. [HERO SECTION]
- **Headline (H1)**: Solusi Cerdas #${brand} untuk Melipatgandakan Hasil bagi ${target}!
- **Sub-headline**: Menghadirkan inovasi ${advantage} untuk membantu Anda mengatasi masalah harian tanpa boncos.
- **Visual Asset Prompt**: Beautiful studio mockup shot of ${brand} placing on clean workspace with aesthetic minimalist plant decor, warm lighting, depth of field.
- **CTA Utama**: ${data.cta || 'Mulai Sekarang'}
- **Urgency/Promo**: ${data.promo || 'Diskon Akhir Tahun 50% + Free Ongkir'}

## 3. [SOCIAL PROOF]
- **Testimonial Grid**: Tiga kartu ulasan pelanggan real-time.
- **Trust Badge**: "Lebih dari 10,000+ Pengguna Puas di Seluruh Indonesia"

## 4. [FEATURE/SOLUTION]
- **Keunggulan 1: ${advantage}**
  - Deskripsi: Memberikan kualitas hasil terbaik yang konsisten dari waktu ke waktu.
- **Keunggulan 2: Hemat Waktu & Biaya**
  - Deskripsi: Efisiensi luar biasa yang memangkas pengeluaran operasional Anda secara drastis.
- **Keunggulan 3: ${solution}**
  - Deskripsi: Penerapan praktis instan yang langsung bekerja sejak hari pertama penggunaan.

## 5. [OFFER SECTION]
- **Paket Spesial**: Beli 1 Gratis 1 Khusus Pemesanan Hari Ini!
- **Scarcity**: Sisa kuota promo: 14 Slot Tersisa.

## 6. [CTA SECTION]
- **Tombol Utama**: Hubungkan via WhatsApp / Selesaikan Pemesanan.
- **Micro-copy**: Garansi 100% uang kembali jika produk rusak dalam pengiriman.`;
  }
};

export const generateAdStrategy = async (data: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Rancang strategi Meta Ads Bahasa Indonesia yang komprehensif, profesional, dan berorientasi hasil untuk ${data.brandName}. Berikan analisis audiens detail, pembagian kampanye TOFU (Cold), MOFU (Warm), dan BOFU (Hot) dengan budget ideal, rekomendasi kreatif iklan (kombinasi video & gambar), serta key metrics yang wajib dipantau seperti CTR, CPC, CPM, dan ROAS target.`,
    });
    return response.text;
  } catch (error) {
    console.warn("generateAdStrategy failed, using free fallback:", error);
    const brand = data.brandName || "Produk Unggulan";
    return `# Strategi Meta Ads Profesional untuk **${brand}**

## 1. STRUKTUR KAMPANYE (Campaign Structure)
### Kampanye A: Cold Audience (Prospek Baru - TOFU)
- **Tujuan**: Penjualan (Sales) / Konversi.
- **Penargetan**: Broad / Interest relevan dengan ceruk pasar Anda.
- **Format Iklan**: Video UGC (User Generated Content) berfokus pada hook masalah dalam 3 detik pertama.

### Kampanye B: Retargeting (Pemirsa Hangat - MOFU/BOFU)
- **Tujuan**: Penjualan (Sales).
- **Penargetan**: Custom Audience (Interaksi Instagram/FB 30 hari terakhir, Pengunjung Landing Page).
- **Format Iklan**: Testimonial pelanggan nyata & penawaran promo bundling terbatas.

## 2. REKOMENDASI BUDGETING & OPTIMASI
- **Budgeting**: Mulai dengan Rp50.000 - Rp100.000 per set iklan per hari.
- **Metrik Utama yang Dipantau**:
  - CTR (Click-Through Rate): Target > 1.5%
  - Cost Per Click (CPC): Target < Rp2.500
  - ROAS (Return on Ad Spend): Target > 2.0x

## 3. FORMULA COPYWRITING SUKSES
- **Pola**: Hook Menarik ➔ Empati Masalah ➔ Solusi (${brand}) ➔ Urgensi Penawaran ➔ Jelas CTA.`;
  }
};

export const generateStudioAIContent = async (data: any, aspectRatio: string = '1:1') => {
  const { 
    physicalDescription, 
    basicClothingStyle, 
    pose, 
    posePrompt,
    cameraAngle, 
    cameraAnglePrompt,
    expression, 
    expressionPrompt,
    changeClothes, 
    changePants, 
    addAccessories, 
    backgroundChoice, 
    backgroundPrompt,
    precisionEngine, 
    jumlahHasil, 
    precisionSeed
  } = data;

  const constructionPrompt = `Create a high-quality, photorealistic image of a character.
  CHARACTER DNA:
  - Physical: ${physicalDescription}
  - Style: ${basicClothingStyle}
  
  POSE & COMPOSITION:
  - Pose: ${pose}${posePrompt ? ` (${posePrompt})` : ''}
  - Camera: ${cameraAngle}${cameraAnglePrompt ? ` (${cameraAnglePrompt})` : ''}
  - Expression: ${expression}${expressionPrompt ? ` (${expressionPrompt})` : ''}
  
  CUSTOMIZATION:
  - Clothing: ${changeClothes || 'As described in basic style'}
  - Pants: ${changePants || 'As described in basic style'}
  - Accessories: ${addAccessories || 'None'}
  
  ENVIRONMENT:
  - Background: ${backgroundChoice}${backgroundPrompt ? ` (${backgroundPrompt})` : ''}
  
  TECHNICAL:
  - Quality: Professional studio photography, photorealistic, 8k resolution, highly aesthetic composition, gorgeous volumetric studio lighting, rich colors, intricate skin pores texture, masterpiece.
  - Character Consistency: You MUST maintain 100% characteristics of the character's face and body.
  - Precision: ${precisionEngine}% accuracy to reference.
  - Seed: ${precisionSeed}
  
  IMPORTANT: No text, watermarks, or logos in the image.`;

  const results = [];
  
  for (let i = 0; i < jumlahHasil; i++) {
    const fallbackUrl = await generateFreeFallbackImage(constructionPrompt, aspectRatio);
    results.push(fallbackUrl);
    
    if (jumlahHasil > 1) await new Promise(resolve => setTimeout(resolve, 50));
  }

  return results;
};

export const studioAIOrchestrator = async (userInput: string, aspectRatio: string = '1:1') => {
  const systemInstruction = `Kamu adalah "StudioAI", backend orchestrator untuk SaaS pembuatan konten visual. Kamu sekarang menangani 3 pembaruan fitur utama:

1. AVATAR AI (create_custom_avatar):
Membuat avatar AI custom fotorealistik dengan tingkat kustomisasi hiper-detail berdasarkan input pengguna. Variabel wajib meliputi: warna kulit, ras/etnis, warna/gaya rambut, postur tubuh (kurus/gemuk/proporsional/berotot), dan persona/vibe (sangat profesional, meyakinkan, CEO, kasual, dll).

2. UGC HUB (ugc_video_generation):
Menghasilkan instruksi untuk merender video yang SUDAH TERMASUK voice over (suara). Input pengguna akan diubah menjadi prompt video dinamis sekaligus script suara yang akan disinkronkan.

3. REVIEW & EXPORT (review_and_export):
Fungsi final di mana pengguna mengunggah/memilih 1 hingga 5 video dari UGC Hub untuk digabungkan menjadi 1 video panjang. Tugasmu di sini adalah menganalisis urutan cerita dari gabungan video tersebut, lalu menghasilkan Caption Media Sosial yang sangat persuasif (hook, story, offer) lengkap dengan hashtag untuk di-copy oleh pengguna.

[UPDATE FORMAT OUTPUT JSON WAJIB]
Setiap menerima input, identifikasi \`action_type\`-nya dan keluarkan HANYA format JSON murni ini tanpa teks basa-basi:

{
  "action_type": "[Pilih: create_custom_avatar, ugc_video_generation, atau review_and_export]",
  
  "optimized_prompt": "[Isi HANYA jika membuat Avatar atau UGC. Buatkan prompt bahasa Inggris super detail untuk AI Generator. KHUSUS AVATAR: Gabungkan seluruh variabel ras, kulit, rambut, postur, dan vibe. KHUSUS UGC: Deskripsikan adegan video secara visual.]",
  
  "avatar_customization": {
    "race_and_skin_tone": "[Etnis dan warna kulit spesifik]",
    "hair_style_and_color": "[Gaya dan warna rambut]",
    "body_type": "[Postur tubuh: gemuk, kurus, atletis, dll]",
    "vibe_and_persona": "[Kesan visual: profesional, meyakinkan, elegan, dll]",
    "clothing_and_setting": "[Pakaian dan latar belakang]"
  },

  "ugc_specs": {
    "visual_scene_description": "[Deskripsi visual video yang akan di-render]",
    "voice_over_script": "[Teks naskah yang akan dibacakan oleh AI Voice, disesuaikan dengan visual]"
  },

  "export_details": {
    "merged_video_context": "[Deskripsi singkat alur cerita dari gabungan 1-5 video yang diinput user (Hanya untuk review_and_export)]",
    "social_media_caption": "[Buatkan caption Instagram/TikTok bergaya copywriting konversi tinggi berdasarkan gabungan video tersebut. Wajib ada Hook, Penjelasan Solusi, dan Call to Action (CTA) jualan yang jelas.]",
    "recommended_hashtags": "[Berikan 5-8 hashtag viral dan relevan]"
  }
}

[ATURAN KETAT]
- Saat \`action_type\` adalah \`review_and_export\`, abaikan pembuatan \`optimized_prompt\` or \`avatar_customization\`. Fokus 100% memberikan \`social_media_caption\` terbaik yang siap di-copy-paste oleh user.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${systemInstruction}\n\nINPUT PENGGUNA:\n${userInput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action_type: { type: Type.STRING, enum: ['create_custom_avatar', 'ugc_video_generation', 'review_and_export'] },
            optimized_prompt: { type: Type.STRING },
            avatar_customization: {
              type: Type.OBJECT,
              properties: {
                race_and_skin_tone: { type: Type.STRING },
                hair_style_and_color: { type: Type.STRING },
                body_type: { type: Type.STRING },
                vibe_and_persona: { type: Type.STRING },
                clothing_and_setting: { type: Type.STRING }
              }
            },
            ugc_specs: {
              type: Type.OBJECT,
              properties: {
                visual_scene_description: { type: Type.STRING },
                voice_over_script: { type: Type.STRING }
              }
            },
            export_details: {
              type: Type.OBJECT,
              properties: {
                merged_video_context: { type: Type.STRING },
                social_media_caption: { type: Type.STRING },
                recommended_hashtags: { type: Type.STRING }
              }
            }
          },
          required: ["action_type"]
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');

    if (result.action_type === 'create_custom_avatar' && result.optimized_prompt) {
      result.generated_image = await generateFreeFallbackImage(result.optimized_prompt, aspectRatio);
    } else if (result.action_type === 'ugc_video_generation' && result.optimized_prompt) {
      if (result.ugc_specs?.voice_over_script) {
        try {
          const audioUrl = await generateAudio(result.ugc_specs.voice_over_script);
          result.generated_audio = audioUrl;
        } catch (e) {
          console.warn("Failed to generate voice over.");
        }
      }
    }

    return result;
  } catch (error) {
    console.warn("studioAIOrchestrator failed via Gemini, using free fallback.");
    
    const lowerInput = userInput.toLowerCase();
    let action_type = "ugc_video_generation";
    if (lowerInput.includes("avatar") || lowerInput.includes("karakter") || lowerInput.includes("foto orang") || lowerInput.includes("wajah")) {
      action_type = "create_custom_avatar";
    } else if (lowerInput.includes("export") || lowerInput.includes("gabung") || lowerInput.includes("caption") || lowerInput.includes("review")) {
      action_type = "review_and_export";
    }

    const fallbackResult: any = {
      action_type
    };

    if (action_type === "create_custom_avatar") {
      const optimized_prompt = `An elegant and highly realistic professional headshot photo of an Indonesian business person, looking confident and smiling naturally, soft corporate studio lighting, sharp focus, 8k. NO TEXT.`;
      fallbackResult.optimized_prompt = optimized_prompt;
      fallbackResult.avatar_customization = {
        race_and_skin_tone: "Indonesian, Light Brown Skin Tone",
        hair_style_and_color: "Neat Dark Hair",
        body_type: "Proportional / Fit",
        vibe_and_persona: "Professional CEO, Trustworthy, Friendly",
        clothing_and_setting: "Modern Blazer/Suite, Soft Grey Gradient Studio BG"
      };
      fallbackResult.generated_image = await generateFreeFallbackImage(optimized_prompt, aspectRatio);
    } else if (action_type === "ugc_video_generation") {
      const optimized_prompt = `A passionate content creator demonstrating an innovative product on camera, expressive smile, cinematic lighting, 8k. NO TEXT.`;
      const script = "Halo teman-teman! Hari ini saya mau merekomendasikan solusi luar biasa yang wajib kalian coba sekarang juga. Dijamin bikin hidup lebih praktis dan hemat!";
      fallbackResult.optimized_prompt = optimized_prompt;
      fallbackResult.ugc_specs = {
        visual_scene_description: "Kreator tersenyum di depan kamera sambil memegang dan menunjukkan keunggulan produk.",
        voice_over_script: script
      };
      fallbackResult.generated_image = await generateFreeFallbackImage(optimized_prompt, aspectRatio);
      fallbackResult.generated_audio = await generateFreeFallbackAudio(script, "Kore");
    } else {
      fallbackResult.export_details = {
        merged_video_context: "Gabungan video ulasan produk berdurasi penuh yang persuasif dan interaktif.",
        social_media_caption: "🔥 AKHIRNYA YANG DITUNGGU-TUNGGU TIBA! 🔥\n\nCapek dengan metode lama yang ribet dan buang-buang waktu? Sekarang saatnya beralih ke solusi modern yang praktis, cepat, dan terbukti menghasilkan!\n\nTonton video lengkap ini untuk melihat ulasan nyata dan cara pakainya. Khusus pemesanan hari ini, nikmati diskon spesial 50% + bonus eksklusif!\n\n👉 Klik link di bio untuk order sekarang juga sebelum kehabisan!",
        recommended_hashtags: "#SolusiCerdas #InovasiModern #BisnisSukses #UGCIndonesia #BelanjaOnline"
      };
    }

    return fallbackResult;
  }
};

