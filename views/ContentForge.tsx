import React, { useState, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  Loader2, 
  Send, 
  Tag, 
  Target, 
  AlertCircle, 
  Palette, 
  User, 
  Maximize, 
  FileText, 
  Image as ImageIcon, 
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Upload,
  X,
  Layers,
  Edit3,
  Check,
  Type,
  Clock
} from 'lucide-react';
import { generateAdImage, editAdImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { useCooldown } from '../hooks/useCooldown';
import { downloadImage, processImageForDownload } from '../utils/downloadUtils';
import { compressImageFile } from '../utils/imageCompression';

interface GeneratedImage {
  id: string;
  url: string;
  isEditing: boolean;
  editPrompt: string;
}

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, type = 'text', hint }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-violet-400" />
        {label}
      </label>
      {hint && (
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-52 p-3 bg-[#111322] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-xl border border-white/5">
            {hint}
          </div>
        </div>
      )}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 bg-white/[0.05] outline-none transition-all text-sm font-medium text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 3 }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-violet-400" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 bg-white/[0.05] outline-none transition-all text-sm font-medium text-white placeholder:text-slate-500 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon, error }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-violet-400" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-5 py-3.5 rounded-xl border appearance-none ${error ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-white/10 bg-white/[0.05] text-white'} focus:border-violet-500 outline-none transition-all text-sm font-medium cursor-pointer shadow-inner`}
      >
        {options.map((opt: any) => {
          const id = typeof opt === 'string' ? opt : opt.id;
          const name = typeof opt === 'string' ? opt : opt.name;
          return <option key={id} value={id} className="bg-[#111322]">{name}</option>;
        })}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const ContentForge: React.FC = () => {
  const { t } = useLanguage();
  const { cooldown, startCooldown } = useCooldown('content_forge', 60);
  const [formData, setFormData] = usePersistentState('content_forge_form', {
    brandName: '',
    objective: 'Konversi',
    problemAngle: '',
    solution: '',
    targetBehavior: '',
    cta: '',
    adText: '', // State baru untuk teks dalam gambar
    fullDescription: '',
    adSize: '1:1',
    visualStyle: 'Realistis',
    colors: '',
    modelType: 'Mohon untuk pilih satu',
    batchCount: '1'
  });

  const [uploadedImage, setUploadedImage] = usePersistentState<string | null>('content_forge_image', null);
  const [generatedResults, setGeneratedResults] = usePersistentState<GeneratedImage[]>('content_forge_results', []);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1024, 0.8);
        setUploadedImage(compressed);
      } catch (err) {
        console.warn('Error compressing uploaded image:', err);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName) return alert('Nama Brand wajib diisi.');
    
    setLoading(true);
    setGeneratedResults([]);
    const count = Math.min(parseInt(formData.batchCount), 10);
    
    try {
      const promises = Array.from({ length: count }).map(() => generateAdImage({ ...formData, image: uploadedImage }));
      const urls = await Promise.all(promises);
      
      const results: GeneratedImage[] = urls
        .filter((url): url is string => !!url)
        .map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url,
          isEditing: false,
          editPrompt: ''
        }));
        
      setGeneratedResults(results);
      startCooldown(60);
    } catch (err) {
      alert('Gagal menghasilkan gambar iklan.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async (imgId: string) => {
    const target = generatedResults.find(img => img.id === imgId);
    if (!target || !target.editPrompt.trim()) return;

    setGeneratedResults(prev => prev.map(img => img.id === imgId ? { ...img, isEditing: true } : img));

    try {
      const newUrl = await editAdImage(target.url, target.editPrompt, formData.adSize);
      if (newUrl) {
        setGeneratedResults(prev => prev.map(img => 
          img.id === imgId ? { ...img, url: newUrl, isEditing: false, editPrompt: '' } : img
        ));
      } else {
        throw new Error("No image returned");
      }
    } catch (err) {
      alert('Gagal mengedit gambar.');
      setGeneratedResults(prev => prev.map(img => img.id === imgId ? { ...img, isEditing: false } : img));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 rounded-2xl shadow-lg shadow-indigo-500/20">
               <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('content.title')}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('content.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 text-left">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Drone X-Pro" icon={Tag} />
            
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
                <Upload className="w-4 h-4 text-violet-400" />
                {t('content.upload_ref')}
              </label>
              <div onClick={() => fileInputRef.current?.click()} className={`relative h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${uploadedImage ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/40'}`}>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {uploadedImage ? (
                  <div className="flex items-center gap-4 px-4 w-full">
                    <img src={uploadedImage} className="w-16 h-16 object-cover rounded-xl shadow-md" alt="Uploaded" />
                    <span className="text-xs font-bold text-slate-300 truncate">Gambar Produk Siap</span>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }} className="ml-auto text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center"><Upload className="w-5 h-5 text-violet-400 mb-1" /><span className="text-[10px] font-black text-slate-400 uppercase">{t('common.upload')}</span></div>
                )}
              </div>
            </div>

            <InputField 
              label={t('content.text_in_image')} 
              name="adText" 
              value={formData.adText} 
              onChange={handleInputChange} 
              placeholder="Contoh: 'DISKON 50%' atau 'Solusi Terbaik'" 
              icon={Type} 
              hint="Teks ini akan dirender secara estetik oleh AI di dalam visual iklan."
            />

            <SelectField 
              label={t('content.batch_count')} 
              name="batchCount" 
              value={formData.batchCount} 
              onChange={handleInputChange} 
              options={['1', '2', '3', '4', '5', '6', '8', '10']} 
              icon={Layers} 
            />
            
            <TextAreaField label={t('common.problem')} name="problemAngle" value={formData.problemAngle} onChange={handleInputChange} placeholder="Pengguna butuh solusi cepat untuk..." icon={AlertCircle} />
            <TextAreaField label={t('content.visual_desc')} name="fullDescription" value={formData.fullDescription} onChange={handleInputChange} placeholder="Produk di atas meja kayu dengan pencahayaan sunset..." icon={FileText} rows={4} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('content.size')} name="adSize" value={formData.adSize} onChange={handleInputChange} options={['1:1', '9:16', '16:9']} icon={Maximize} />
              <SelectField label={t('common.style')} name="visualStyle" value={formData.visualStyle} onChange={handleInputChange} options={['Realistis', '3D Render', 'Minimalis']} icon={Palette} />
            </div>

            <SelectField 
              label={t('content.model_type')} 
              name="modelType" 
              value={formData.modelType} 
              onChange={handleInputChange} 
              options={[{id: 'Mohon untuk pilih satu', name: '- Pilih -'}, {id: 'Pria', name: 'Pria Dewasa'}, {id: 'Wanita', name: 'Wanita Dewasa'}, {id: 'Tanpa Model', name: 'Tanpa Model'}]} 
              icon={User} 
            />

            <button type="submit" disabled={loading || cooldown > 0} className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-900/30 active:scale-[0.98] mt-4 cursor-pointer">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (cooldown > 0 ? <Clock className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />)}
              {loading ? t('content.generating') : (cooldown > 0 ? `TUNGGU ${cooldown}S` : t('content.generate_btn'))}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col sticky top-24 overflow-hidden">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('content.hub_title')}</span>
            </div>
            {generatedResults.length > 0 && (
               <button onClick={() => setGeneratedResults([])} className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest flex items-center gap-2 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> {t('content.clear_canvas')}</button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {generatedResults.length > 0 ? (
              <div className={`grid gap-8 ${
                generatedResults.length === 1 
                ? 'grid-cols-1' 
                : generatedResults.length <= 4 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              }`}>
                {generatedResults.map((res) => (
                  <div key={res.id} className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col">
                    <div className="relative group aspect-square bg-black/20 flex items-center justify-center">
                       {res.isEditing && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-emerald-400 rounded-full animate-spin" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-widest font-mono">Memperbarui Aset...</span>
                         </div>
                       )}
                       <img src={res.url} className="w-full h-full object-cover" alt="Generated" />
                       <button onClick={() => processImageForDownload(res.url, formData.adSize as any, `adflow-${Date.now()}.png`)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-emerald-600 cursor-pointer">
                          <Download className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 space-y-4 border-t border-white/5 mt-auto">
                       <div className="flex items-center gap-2 text-violet-400">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Edit Instruksi AI</span>
                       </div>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={res.editPrompt} 
                            onChange={(e) => setGeneratedResults(prev => prev.map(img => img.id === res.id ? { ...img, editPrompt: e.target.value } : img))}
                            placeholder="Contoh: 'Ubah latar jadi futuristik'" 
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all pr-12 shadow-inner"
                          />
                          <button 
                            onClick={() => handleEditImage(res.id)}
                            disabled={res.isEditing || !res.editPrompt.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-30 transition-all shadow-lg cursor-pointer"
                          >
                             <Check className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-8">
                 <div className="w-32 h-32 bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
                    {loading ? <Loader2 className="w-14 h-14 text-violet-400 animate-spin" /> : <ImageIcon className="w-14 h-14 text-violet-400" />}
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-3xl font-black text-white tracking-tight">Menunggu Parameter Visual</h4>
                   <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Lengkapi formulir di sebelah kiri untuk menghasilkan variasi visual iklan berkualitas tinggi.</p>
                 </div>
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-[#0e101c]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
             <div className="flex gap-4">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Gemini 2.5 Flash</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-400" /> High-Res Export</span>
             </div>
             <span className="opacity-50">TIM MARKETING AI Creative Studio Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentForge;