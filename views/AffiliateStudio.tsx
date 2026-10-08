
import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Video, 
  Mic2, 
  Sparkles, 
  Upload, 
  Play, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Settings,
  Palette,
  Layout,
  Type as TypeIcon,
  Save,
  Copy,
  ExternalLink,
  Loader2,
  Tag,
  Zap,
  Rocket,
  Volume2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { generateVideoPrompt, generateAudio, generateAestheticProductPhoto, editAdImage } from '../services/geminiService';
import { downloadImage, processImageForDownload } from '../utils/downloadUtils';
import { compressImageFile } from '../utils/imageCompression';

interface Scene {
  sceneNumber: number;
  description: string;
  audioNarration: string;
  technicalPrompt: string;
  duration: number;
  cameraAngle: string;
  previewImage?: string;
  audioUrl?: string;
}

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, type = 'text' }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-indigo-400" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-white/10 focus:border-indigo-500 bg-white/[0.05] outline-none transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 3 }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-indigo-400" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-white/10 focus:border-indigo-500 bg-white/[0.05] outline-none transition-all text-[15px] font-medium text-white placeholder:text-slate-500 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-indigo-400" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-white/10 bg-white/[0.05] text-white focus:border-indigo-500 outline-none transition-all text-[15px] font-medium cursor-pointer shadow-inner appearance-none"
      >
        {options.map((opt: any) => {
          const id = typeof opt === 'string' ? opt : opt.id;
          const name = typeof opt === 'string' ? opt : opt.name;
          return <option key={id} value={id} className="bg-[#241542]">{name}</option>;
        })}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const AffiliateStudio: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [generatingScene, setGeneratingScene] = useState<number | null>(null);
  
  // Form State
  const [brandName, setBrandName] = usePersistentState('affiliate_brandName', '');
  const [productFeatures, setProductFeatures] = usePersistentState('affiliate_productFeatures', '');
  const [description, setDescription] = usePersistentState('affiliate_description', '');
  const [background, setBackground] = usePersistentState('affiliate_background', '');
  const [colorPalette, setColorPalette] = usePersistentState('affiliate_colorPalette', '');
  const [videoModel, setVideoModel] = usePersistentState('affiliate_videoModel', 'Review Produk');
  const [sceneCount, setSceneCount] = usePersistentState('affiliate_sceneCount', 5);
  const [aspectRatio, setAspectRatio] = usePersistentState('affiliate_aspectRatio', '9:16');
  const [pose, setPose] = usePersistentState('affiliate_pose', 'Standing');
  const [accent, setAccent] = usePersistentState('affiliate_accent', 'Indonesia');
  const [productImage, setProductImage] = usePersistentState<string | null>('affiliate_productImage', null);
  const [affiliatorImage, setAffiliatorImage] = usePersistentState<string | null>('affiliate_affiliatorImage', null);
  const [customInstructions, setCustomInstructions] = usePersistentState<string[]>('affiliate_customInstructions', []);

  // Result State
  const [storyboard, setStoryboard] = usePersistentState<Scene[]>('affiliate_storyboard', []);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [showProductionOptions, setShowProductionOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const affiliatorInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1024, 0.8);
        setter(compressed);
      } catch (err) {
        console.warn('Error compressing uploaded file:', err);
      }
    }
  };

  const handleDownloadImage = (imageUrl: string, sceneIdx: number) => {
    processImageForDownload(imageUrl, aspectRatio as any, `scene-${sceneIdx + 1}.png`);
  };

  const handleGenerateStoryboard = async () => {
    if (!brandName || !productFeatures) return;
    setLoading(true);
    try {
      const result = await generateVideoPrompt({
        brandName,
        productFeatures,
        detailedDescription: description,
        visualContext: { background, palette: colorPalette },
        videoModel,
        numberOfScenes: sceneCount,
        aspectRatio,
        productImage,
        modelImage: affiliatorImage,
        sceneInputs: customInstructions,
        pose,
        accent,
        isAffiliate: true
      });
      
      const parsed = JSON.parse(result);
      setStoryboard(parsed.scenes || []);
    } catch (error) {
      console.error("Failed to generate storyboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenderVisual = async (index: number) => {
    setGeneratingScene(index);
    try {
      const scene = storyboard[index];
      const imageUrl = await generateAestheticProductPhoto({
        brandName,
        ambiance: `${scene.technicalPrompt}. Pose: ${pose}. The model/character from the uploaded image must be wearing/using the product from the product image. Maintain 100% characteristics of the model's face and body. IMPORTANT: DO NOT INCLUDE ANY TEXT, LABELS, OR WATERMARKS IN THE IMAGE.`,
        bgColor: colorPalette || 'neutral',
        productPosition: 'natural integration with model',
        image: productImage,
        modelImage: affiliatorImage,
        aspectRatio
      });
      
      if (imageUrl) {
        const newStoryboard = [...storyboard];
        newStoryboard[index].previewImage = imageUrl;
        setStoryboard(newStoryboard);
      }
    } catch (error) {
      console.error("Failed to render visual", error);
    } finally {
      setGeneratingScene(null);
    }
  };

  const handleEditVisual = async (index: number, editPrompt: string) => {
    const scene = storyboard[index];
    if (!scene.previewImage) return;
    
    setGeneratingScene(index);
    try {
      const editedUrl = await editAdImage(scene.previewImage, editPrompt, aspectRatio);
      if (editedUrl) {
        const newStoryboard = [...storyboard];
        newStoryboard[index].previewImage = editedUrl;
        setStoryboard(newStoryboard);
      }
    } catch (error) {
      console.error("Failed to edit visual", error);
    } finally {
      setGeneratingScene(null);
    }
  };

  const handleUpdateScene = (index: number, field: keyof Scene, value: any) => {
    const newStoryboard = [...storyboard];
    (newStoryboard[index] as any)[field] = value;
    setStoryboard(newStoryboard);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
      {/* Sidebar Input (4 Columns) */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 rounded-2xl shadow-lg shadow-indigo-500/20">
               <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('affiliate.title')}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('affiliate.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-8 text-left">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Layout className="w-3 h-3" /> {t('affiliate.brand_data')}
              </h4>
              <InputField label={t('common.brand_name')} name="brandName" value={brandName} onChange={(e: any) => setBrandName(e.target.value)} placeholder="GlowUp Serum" icon={Tag} />
              <InputField label="Fitur Utama Produk" name="productFeatures" value={productFeatures} onChange={(e: any) => setProductFeatures(e.target.value)} placeholder="Mencerahkan dalam 7 hari" icon={Sparkles} />
              <TextAreaField label={t('common.description')} name="description" value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Jelaskan lebih detail tentang produk ini..." icon={TypeIcon} />
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Palette className="w-3 h-3" /> {t('affiliate.visual_context')}
              </h4>
              <InputField label={t('affiliate.background')} name="background" value={background} onChange={(e: any) => setBackground(e.target.value)} placeholder="Ruang Tamu Minimalis" icon={ImageIcon} />
              <InputField label={t('affiliate.color_palette')} name="colorPalette" value={colorPalette} onChange={(e: any) => setColorPalette(e.target.value)} placeholder="Ungu, Biru, Hijau" icon={Palette} />
              <SelectField label={t('affiliate.video_model')} name="videoModel" value={videoModel} onChange={(e: any) => setVideoModel(e.target.value)} options={['Review Produk', 'Unboxing', 'Penggunaan/In-Use', 'Masalah-Solusi']} icon={Video} />
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Upload className="w-3 h-3" /> {t('affiliate.asset_upload')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-square border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${productImage ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, setProductImage)} accept="image/*" className="hidden" />
                  {productImage ? (
                    <img src={productImage} className="w-full h-full object-cover rounded-[1.4rem]" alt="Product" />
                  ) : (
                    <div className="flex flex-col items-center"><ImageIcon className="w-6 h-6 text-indigo-400 mb-1" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Produk</span></div>
                  )}
                </div>
                <div 
                  onClick={() => affiliatorInputRef.current?.click()}
                  className={`relative aspect-square border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${affiliatorImage ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50'}`}
                >
                  <input type="file" ref={affiliatorInputRef} onChange={(e) => handleFileUpload(e, setAffiliatorImage)} accept="image/*" className="hidden" />
                  {affiliatorImage ? (
                    <img src={affiliatorImage} className="w-full h-full object-cover rounded-[1.4rem]" alt="Affiliator" />
                  ) : (
                    <div className="flex flex-col items-center"><ImageIcon className="w-6 h-6 text-indigo-400 mb-1" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Affiliator</span></div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Settings className="w-3 h-3" /> {t('affiliate.technical_config')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <InputField label={t('affiliate.scene_count')} name="sceneCount" value={sceneCount} onChange={(e: any) => setSceneCount(parseInt(e.target.value))} type="number" icon={Plus} />
                <SelectField label={t('affiliate.aspect_ratio')} name="aspectRatio" value={aspectRatio} onChange={(e: any) => setAspectRatio(e.target.value)} options={['9:16', '16:9', '1:1']} icon={Layout} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                  label={t('affiliate.pose')} 
                  name="pose" 
                  value={pose} 
                  onChange={(e: any) => setPose(e.target.value)} 
                  options={[
                    { id: 'Standing', name: 'Berdiri (Standing)' },
                    { id: 'Medium Shot', name: 'Medium Shot' },
                    { id: 'Close Up', name: 'Close Up' },
                    { id: 'Sitting', name: 'Duduk (Sitting)' },
                    { id: 'Walking', name: 'Berjalan (Walking)' },
                    { id: 'Holding Product', name: 'Memegang Produk' },
                    { id: 'Pointing to Product', name: 'Menunjuk Produk' },
                    { id: 'Smiling to Camera', name: 'Tersenyum ke Kamera' },
                    { id: 'Full Body Shot', name: 'Full Body Shot' },
                    { id: 'Action Shot', name: 'Aksi (Action)' },
                    { id: 'Over the Shoulder', name: 'Over the Shoulder' },
                    { id: 'Low Angle', name: 'Low Angle (Heroic)' }
                  ]} 
                  icon={Zap} 
                />
                <SelectField 
                  label="Aksen Suara" 
                  name="accent" 
                  value={accent} 
                  onChange={(e: any) => setAccent(e.target.value)} 
                  options={[
                    { id: 'Indonesia', name: 'Indonesia' },
                    { id: 'English', name: 'English' }
                  ]} 
                  icon={Mic2} 
                />
              </div>
            </div>

            <button 
              onClick={handleGenerateStoryboard} 
              disabled={loading || !brandName || !productFeatures} 
              className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white py-4.5 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-900/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? t('affiliate.generating') : t('affiliate.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas (8 Columns) */}
      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col sticky top-24 overflow-hidden">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">TIM MARKETING AI Affiliate Suite</span>
            </div>
            {storyboard.length > 0 && (
              <div className="flex gap-4">
                <button onClick={() => setStoryboard([])} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> {t('common.clear')}</button>
                <button className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"><Download className="w-3.5 h-3.5" /> Export JSON</button>
              </div>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {storyboard.length > 0 ? (
              <div className="grid gap-8 grid-cols-1">
                {storyboard.map((scene, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl p-10 space-y-8"
                  >
                    {/* Header: Scene Number and Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-2xl tracking-tight">Adegan {idx + 1}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Clock className="w-3 h-3" /> MAX 8 DETIK
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleRenderVisual(idx)}
                          disabled={generatingScene === idx}
                          className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border border-indigo-500/20 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                        >
                          {generatingScene === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          {t('affiliate.render_visual')}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      {/* Visual Preview and Edit */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="relative aspect-[9/16] bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
                          {scene.previewImage ? (
                            <>
                              <img src={scene.previewImage} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button
                                onClick={() => handleDownloadImage(scene.previewImage!, idx)}
                                className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-emerald-600 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-30 shadow-lg cursor-pointer"
                                title="Download Image"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/10">
                              <ImageIcon className="w-16 h-16 mb-4" />
                              <span className="text-[12px] font-bold uppercase tracking-widest">No Preview</span>
                            </div>
                          )}
                          
                          {generatingScene === idx && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4">
                               <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-emerald-400 rounded-full animate-spin" />
                               <span className="text-[11px] font-bold text-white uppercase tracking-widest font-mono">Rendering...</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <Edit3 className="w-3.5 h-3.5" /> {t('affiliate.edit_visual')}
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Ganti latar jadi kamar..."
                              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-5 pr-14 py-3 text-sm font-medium text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditVisual(idx, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                            <button 
                              onClick={(e) => {
                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                handleEditVisual(idx, input.value);
                                input.value = '';
                              }}
                              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content Editor */}
                      <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-5 h-5 text-indigo-400" />
                            <label className="text-[12px] font-bold uppercase tracking-widest text-indigo-400">Narasi / Dialog (Otomatis)</label>
                          </div>
                          <textarea 
                            value={scene.audioNarration}
                            onChange={(e) => handleUpdateScene(idx, 'audioNarration', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-xl font-bold text-slate-200 italic leading-relaxed focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none shadow-inner"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            <label className="text-[12px] font-bold uppercase tracking-widest text-emerald-400">Instruksi Teknis Video (AV Sync)</label>
                          </div>
                          <textarea 
                            value={scene.technicalPrompt}
                            onChange={(e) => handleUpdateScene(idx, 'technicalPrompt', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-sm font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-all h-64 resize-none shadow-inner leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-12 flex flex-col items-center gap-8">
                  {!showProductionOptions ? (
                    <button 
                      onClick={() => setShowProductionOptions(true)}
                      className="px-10 py-5 bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white font-bold text-lg rounded-[2rem] flex items-center gap-4 transition-all shadow-2xl shadow-violet-900/30 active:scale-[0.98] cursor-pointer"
                    >
                      <Video className="w-6 h-6" />
                      {t('affiliate.production_btn')}
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="w-full max-w-4xl bg-[#241542]/80 rounded-[3rem] border border-indigo-500/20 p-10 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="text-center mb-10">
                        <h4 className="text-3xl font-bold text-white tracking-tight">Render Video dengan Engine AI</h4>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Salin instruksi sinkronisasi adegan di atas ke platform pilihan berikut.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <button 
                          onClick={() => window.open('https://www.meta.ai/ai-video-generator', '_blank')}
                          className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-4 shadow-xl cursor-pointer"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xl font-bold text-white tracking-tight">Meta AI</p>
                        </button>
                        
                        <button 
                          onClick={() => window.open('https://labs.google/flow/about', '_blank')}
                          className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-4 shadow-xl cursor-pointer"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Rocket className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xl font-bold text-white tracking-tight">Flow AI</p>
                        </button>
                        
                        <button 
                          onClick={() => window.open('https://grok.com/imagine', '_blank')}
                          className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-violet-500/50 transition-all flex flex-col items-center gap-4 shadow-xl cursor-pointer"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-3xl font-bold text-white">/</span>
                          </div>
                          <p className="text-xl font-bold text-white tracking-tight">Grok</p>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setShowProductionOptions(false)}
                        className="mt-10 text-slate-500 hover:text-slate-300 font-bold text-[11px] uppercase tracking-[0.3em] block mx-auto transition-colors cursor-pointer"
                      >
                        KEMBALI KE STORYBOARD
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-8 py-20">
                 <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-xl">
                    <Sparkles className="w-12 h-12 text-indigo-400" />
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-2xl font-bold text-white tracking-tight">Siap Merumuskan Konten Berkonversi Tinggi?</h4>
                   <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto">Isi konfigurasi di panel kiri untuk merancang storyboard video affiliate berstandar profesional.</p>
                 </div>
                 <div className="grid grid-cols-3 gap-6 w-full max-w-lg pt-6">
                    {[
                      { icon: Video, label: "High Conversion" },
                      { icon: Mic2, label: "AI Voice Sync" },
                      { icon: ImageIcon, label: "Visual Preview" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2.5">
                        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                          <item.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-[#241542]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
             <div className="flex gap-4">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Gemini 2.5 Flash</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> TIM MARKETING AI Engine</span>
             </div>
             <span className="opacity-60">TIM MARKETING AI Suite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateStudio;
