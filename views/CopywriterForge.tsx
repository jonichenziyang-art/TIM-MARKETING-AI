
import React, { useState, FC } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Send, 
  Type, 
  MessageSquare, 
  Target, 
  Zap, 
  Copy, 
  Check, 
  Share2, 
  Tag,
  Palette,
  Layout,
  Download,
  Clock
} from 'lucide-react';
import { generateCopyVariations } from '../services/geminiService';
import { CopyVariation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { useCooldown } from '../hooks/useCooldown';
import { downloadText } from '../utils/downloadUtils';

// Properly type sub-component to allow standard React attributes like 'key'
const CopyCard: FC<{ variation: CopyVariation; index: number }> = ({ variation, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `${variation.hook}\n\n${variation.body}\n\n${variation.cta}\n\n${variation.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 lg:p-10 relative group animate-in slide-in-from-bottom-4 duration-500 shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 via-blue-500 to-emerald-400" />
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 border border-violet-500/30">
            {index + 1}
          </div>
          <div>
            <h5 className="font-bold text-white text-lg lg:text-xl tracking-tight">Variasi {index === 0 ? 'Emotional Resonance' : index === 1 ? 'Direct Response' : 'Urgency & Scarcity'}</h5>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Copy Output</p>
          </div>
        </div>
        
        <button 
          onClick={handleCopy}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-slate-400 hover:text-emerald-400 flex items-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] block">Hook (Pancingan Utama)</span>
          <p className="text-lg lg:text-xl font-bold text-white leading-snug tracking-tight italic">"{variation.hook}"</p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Body Copy (Penjelasan)</span>
          <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
            {variation.body}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] block">Call to Action</span>
            <p className="text-emerald-400 font-bold">{variation.cta}</p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Hashtags</span>
            <p className="text-slate-500 text-xs font-bold">{variation.hashtags}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopywriterForge: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { cooldown, startCooldown } = useCooldown('copywriter', 60);
  const [results, setResults] = usePersistentState<CopyVariation[]>('copywriter_results', []);
  const [formData, setFormData] = usePersistentState('copywriter_form', {
    brandName: '',
    platform: 'Instagram Caption',
    tone: 'Persuasif & Profesional',
    description: '',
    audience: '',
    angle: 'Curiosity (Rasa Penasaran)',
    cta: 'Klik Link di Bio'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.description) {
      alert('Harap isi Nama Brand dan Deskripsi Produk.');
      return;
    }
    
    setLoading(true);
    setResults([]);
    try {
      const data = await generateCopyVariations(formData);
      setResults(data);
      startCooldown(60);
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan copywriting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* INPUT PANEL */}
      <div className="lg:col-span-5 space-y-6 lg:space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-white/10 shadow-2xl space-y-8 lg:space-y-10">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="p-3 lg:p-3.5 bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 rounded-2xl lg:rounded-[1.5rem] shadow-lg shadow-indigo-500/20">
               <Type className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">{t('copywriter.title')}</h3>
              <p className="text-slate-500 text-[10px] lg:text-[11px] font-black uppercase tracking-widest mt-1">{t('copywriter.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5 lg:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Tag className="w-3.5 h-3.5 text-violet-400" />
                {t('common.brand_name')}
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                placeholder="Misal: SkinCare Glow Up"
                className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Layout className="w-3.5 h-3.5 text-violet-400" />
                  {t('copywriter.platform')}
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
                >
                  <option className="bg-[#111322]">Instagram Caption</option>
                  <option className="bg-[#111322]">TikTok Caption</option>
                  <option className="bg-[#111322]">Meta Ads (FB/IG)</option>
                  <option className="bg-[#111322]">Google Ads Description</option>
                  <option className="bg-[#111322]">LinkedIn Post</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Palette className="w-3.5 h-3.5 text-violet-400" />
                  {t('copywriter.tone')}
                </label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
                >
                  <option className="bg-[#111322]">Persuasif & Profesional</option>
                  <option className="bg-[#111322]">Santai & Menarik (Anak Muda)</option>
                  <option className="bg-[#111322]">Witty & Cerdas</option>
                  <option className="bg-[#111322]">Formal & Eksekutif</option>
                  <option className="bg-[#111322]">Misterius & Penasaran</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                {t('strategist.product_desc')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Jelaskan produk Anda..."
                className="w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium resize-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Target className="w-3.5 h-3.5 text-violet-400" />
                {t('common.target_audience')}
              </label>
              <input
                type="text"
                name="audience"
                value={formData.audience}
                onChange={handleInputChange}
                placeholder="Misal: Ibu rumah tangga"
                className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  {t('copywriter.angle')}
                </label>
                <select
                  name="angle"
                  value={formData.angle}
                  onChange={handleInputChange}
                  className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
                >
                  <option className="bg-[#111322]">Curiosity (Penasaran)</option>
                  <option className="bg-[#111322]">Social Proof (Testimoni)</option>
                  <option className="bg-[#111322]">Authority (Ahli/Pakar)</option>
                  <option className="bg-[#111322]">Problem-Solution (Masalah-Solusi)</option>
                  <option className="bg-[#111322]">Scarcity (Kelangkaan)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Share2 className="w-3.5 h-3.5 text-violet-400" />
                  {t('common.cta')}
                </label>
                <input
                  type="text"
                  name="cta"
                  value={formData.cta}
                  onChange={handleInputChange}
                  placeholder="Misal: Klik Link di Bio"
                  className="w-full px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white py-4 lg:py-5 rounded-xl font-bold text-base lg:text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 lg:gap-4 shadow-xl shadow-violet-900/30 active:scale-[0.98] mt-4 cursor-pointer"
            >
              {loading ? <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 animate-spin" /> : (cooldown > 0 ? <Clock className="w-6 h-6" /> : <Sparkles className="w-6 h-6 lg:w-7 lg:h-7" />)}
              {loading ? t('copywriter.generating') : (cooldown > 0 ? `TUNGGU ${cooldown}S` : t('copywriter.generate_btn'))}
            </button>
          </form>
        </div>
      </div>

      {/* OUTPUT PANEL */}
      <div className="lg:col-span-7 space-y-6 lg:space-y-8">
        {results.length > 0 ? (
          <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 px-2">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 lg:p-3 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 rounded-xl lg:rounded-2xl border border-indigo-500/30">
                   <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                 </div>
                 <div>
                   <h4 className="text-xl lg:text-2xl font-black text-white uppercase tracking-widest">Variasi Copywriting</h4>
                   <p className="text-slate-400 font-medium text-xs lg:text-sm">Pilih formula copy yang selaras dengan pesan utama kampanye Anda.</p>
                 </div>
               </div>
               <button 
                 onClick={() => {
                   const text = results.map((r, i) => `Variasi ${i+1}\n\nHook: ${r.hook}\n\nBody: ${r.body}\n\nCTA: ${r.cta}\n\nHashtags: ${r.hashtags}\n\n-----------------\n`).join('\n');
                   downloadText('copywriting-variations.txt', text);
                 }}
                 className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
               >
                 <Download className="w-4 h-4" />
                 Download All
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
              {results.map((res, idx) => (
                <CopyCard key={idx} variation={res} index={idx} />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-[2.5rem] border border-white/10 border-dashed flex flex-col items-center justify-center text-center p-8 lg:p-20 opacity-40">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-6 lg:mb-10 border border-white/10 shadow-2xl">
              <Type className="w-10 h-10 lg:w-12 lg:h-12 text-slate-500" />
            </div>
            {loading ? (
              <div className="space-y-3 lg:space-y-4">
                 <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 text-violet-400 animate-spin mx-auto" />
                 <h4 className="text-xl lg:text-2xl font-bold text-white">AI Sedang Menyusun Naskah...</h4>
                 <p className="text-slate-400 max-w-sm mx-auto font-medium text-sm lg:text-base">Merumuskan kalimat bernilai konversi tinggi untuk brand Anda.</p>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                <h4 className="text-xl lg:text-2xl font-bold text-white">Kanvas Copywriter Siap</h4>
                <p className="text-slate-400 max-w-sm mx-auto font-medium text-base lg:text-lg leading-relaxed">
                  Lengkapi data produk di sebelah kiri untuk menghasilkan copywriting yang memikat dan berdaya jual tinggi.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CopywriterForge;
