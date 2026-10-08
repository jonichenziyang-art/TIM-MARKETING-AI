import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Loader2, 
  X, 
  Palette, 
  Layout, 
  Sun, 
  User, 
  Layers, 
  Coffee, 
  Clock,
  Download,
  FileText,
  Tag
} from 'lucide-react';
import { generateAestheticProductPhoto } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { useCooldown } from '../hooks/useCooldown';
import { downloadImage, processImageForDownload } from '../utils/downloadUtils';

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-violet-400" />
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-violet-400" />
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium cursor-pointer shadow-inner"
    >
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#241542]">{opt}</option>)}
    </select>
  </div>
);

const ProductPhotoDesigner: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { cooldown, startCooldown } = useCooldown('product_photo', 60);
  const [uploadedImage, setUploadedImage] = usePersistentState<string | null>('product_photo_image', null);
  const [resultImage, setResultImage] = usePersistentState<string | null>('product_photo_result', null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = usePersistentState('product_photo_form', {
    brandName: '',
    bgColor: 'Putih',
    productPosition: 'Dipakai',
    brightness: 'Netral',
    humanTalent: 'Tangan Perempuan',
    productQuantity: '1',
    accessories: 'Meja',
    ambiance: 'Siang',
    aspectRatio: '1:1',
    detailedDescription: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!formData.brandName) return alert('Nama Brand wajib diisi');
    if (!uploadedImage) return alert('Harap upload foto produk asli terlebih dahulu');
    
    setLoading(true);
    setResultImage(null);
    try {
      const result = await generateAestheticProductPhoto({ 
        ...formData, 
        image: uploadedImage,
        aspectRatio: formData.aspectRatio
      });
      setResultImage(result);
      startCooldown(60);
    } catch (err) {
      alert('Gagal menghasilkan foto produk estetik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 animate-in fade-in duration-700">
      {/* INPUT PANEL */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8 text-left relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Camera className="w-32 h-32 text-indigo-400" />
           </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 rounded-2xl shadow-lg shadow-indigo-500/20">
               <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{t('product_photo.title')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('product_photo.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Casing Hape iPhone" icon={Tag} />
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                {t('product_photo.upload_ref')}
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-28 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all cursor-pointer ${uploadedImage ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 bg-white/[0.05]'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {uploadedImage ? (
                  <div className="flex items-center gap-4 px-4 w-full h-full">
                    <img src={uploadedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white/10" />
                    <div className="flex-1">
                       <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">{t('product_photo.asset_detected')}</p>
                       <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }} className="text-rose-400 text-[10px] font-bold mt-1 hover:underline cursor-pointer">{t('product_photo.remove_replace')}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('common.upload')}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('product_photo.bg_color')} name="bgColor" value={formData.bgColor} onChange={handleInputChange} options={['Putih', 'Abu Muda', 'Oranye', 'Biru Pastel', 'Hijau Sage', 'Custom (Lihat Detail)']} icon={Palette} />
              <SelectField label={t('product_photo.position')} name="productPosition" value={formData.productPosition} onChange={handleInputChange} options={['Dipakai', 'Diletakkan', 'Melayang', 'Detail Dekat']} icon={Layout} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <SelectField label={t('product_photo.brightness')} name="brightness" value={formData.brightness} onChange={handleInputChange} options={['Netral', 'Terang (Bright)', 'Moody (Gelap)', 'Cinematic']} icon={Sun} />
               <SelectField label={t('product_photo.talent')} name="humanTalent" value={formData.humanTalent} onChange={handleInputChange} options={['Tangan Perempuan', 'Tangan Pria', 'Wajah & Tubuh', 'Tanpa Talent']} icon={User} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputField label={t('product_photo.quantity')} name="productQuantity" value={formData.productQuantity} onChange={handleInputChange} placeholder="1" icon={Layers} />
               <SelectField label={t('product_photo.accessories')} name="accessories" value={formData.accessories} onChange={handleInputChange} options={['Meja', 'Tanaman', 'Laptop', 'Latar Minimalis', 'Peralatan Makan']} icon={Coffee} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('product_photo.ambiance')} name="ambiance" value={formData.ambiance} onChange={handleInputChange} options={['Siang', 'Malam', 'Studio Lighting', 'Outdoor Sun']} icon={Clock} />
              <SelectField label="Aspek Rasio" name="aspectRatio" value={formData.aspectRatio} onChange={handleInputChange} options={['1:1', '9:16', '16:9', '4:5']} icon={Layout} />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                {t('strategist.additional_notes')}
              </label>
              <textarea
                name="detailedDescription"
                value={formData.detailedDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="Misal: Casing ponsel iPhone 15 Pro, diletakkan miring dengan pencahayaan studio lembut..."
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-violet-500 outline-none transition-all text-sm font-medium resize-none shadow-inner shadow-black/20"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !uploadedImage || cooldown > 0}
              className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-violet-900/30 active:scale-[0.98] mt-4 flex items-center justify-center gap-4 disabled:opacity-30 cursor-pointer"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : cooldown > 0 ? <Clock className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
              {loading ? t('product_photo.generating') : cooldown > 0 ? `TUNGGU ${cooldown}S` : t('product_photo.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* OUTPUT PANEL */}
      <div className="lg:col-span-7">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[700px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center gap-4">
               <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
               </div>
               <div className="h-5 w-[1px] bg-slate-700 mx-2" />
               <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 font-mono">TIM MARKETING AI Virtual Studio</span>
             </div>
             {resultImage && (
              <button 
                onClick={() => processImageForDownload(resultImage, formData.aspectRatio as any, `photo-${Date.now()}.png`)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-7 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-300" /> Download Photo
              </button>
             )}
          </div>

          <div className="flex-1 p-10 flex items-center justify-center bg-[#1a0b2e]/20 relative">
             {resultImage ? (
               <div className={`relative group max-w-2xl w-full ${formData.aspectRatio === '9:16' ? 'aspect-[9/16]' : formData.aspectRatio === '16:9' ? 'aspect-[16/9]' : formData.aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'} animate-in zoom-in-95 duration-500`}>
                  <img src={resultImage} className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-4 border-white/10" alt="Result" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
                     <div className="text-left">
                        <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Aesthetic Studio Output</p>
                        <h4 className="text-white text-2xl font-bold">{formData.brandName}</h4>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center opacity-40 text-center space-y-8 py-20">
                  {loading ? (
                    <div className="flex flex-col items-center">
                       <div className="w-24 h-24 relative mb-8">
                          <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-emerald-400 rounded-full animate-spin" />
                          <Camera className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
                       </div>
                       <h4 className="text-white text-2xl font-bold tracking-tight mb-2">Merender Studio Virtual...</h4>
                       <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                         Mengintegrasikan produk dengan pencahayaan dan komposisi latar pilihan secara presisi.
                       </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group">
                        <Palette className="w-12 h-12 text-slate-400 group-hover:text-indigo-400 transition-all duration-500" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-white tracking-tight">Studio Fotografi Komersial</h4>
                        <p className="text-slate-400 text-sm font-medium max-w-md mx-auto leading-relaxed">
                          Hasilkan visual produk berkualitas komersial dengan pencahayaan studio terkalibrasi dan komposisi berstandar industri.
                        </p>
                      </div>
                    </>
                  )}
               </div>
             )}
          </div>

          <div className="px-10 py-5 bg-[#0e101c]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" /> Studio Engine Active</span>
               <span className="opacity-50">Resolution: High Fidelity</span>
             </div>
             <span className="opacity-50">TIM MARKETING AI Visual Product Studio Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoDesigner;