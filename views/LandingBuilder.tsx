
import React, { useState } from 'react';
import { 
  Layout, 
  CheckCircle, 
  Code, 
  Loader2, 
  PanelRightOpen, 
  Rocket, 
  Target, 
  Zap, 
  MessageSquare, 
  MousePointer2, 
  Palette, 
  ShieldCheck, 
  Sparkles,
  FileText,
  UserCheck,
  Tag,
  ArrowRight,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { generateLandingPageStructure } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadText } from '../utils/downloadUtils';

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
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all text-sm font-medium bg-white/[0.05] text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 2 }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5 text-violet-400" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all text-sm font-medium bg-white/[0.05] text-white placeholder:text-slate-500 resize-none shadow-inner"
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
      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] text-white font-medium focus:border-violet-500 outline-none transition-all text-sm shadow-inner"
    >
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#241542]">{opt}</option>)}
    </select>
  </div>
);

const LandingBuilder: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = usePersistentState('landing_form', {
    brandName: '',
    targetAudience: '',
    competitiveAdvantage: '',
    problemAngle: '',
    solution: '',
    keyBenefit: '',
    targetBehavior: '',
    tone: 'Persuasif & Profesional',
    brandValues: '',
    promo: '',
    fullDescription: '',
    testimonialCount: '3-5',
    keywords: '',
    layout: 'AIDA (Attention, Interest, Desire, Action)',
    cta: 'Mulai Sekarang'
  });

  const [blueprint, setBlueprint] = usePersistentState('landing_blueprint', '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuild = async () => {
    if (!formData.brandName || !formData.targetAudience) {
      alert('Harap isi Nama Brand dan Target Audiens.');
      return;
    }
    setLoading(true);
    setBlueprint('');
    try {
      const result = await generateLandingPageStructure(formData);
      setBlueprint(result || '');
    } catch (err) {
      console.error(err);
      setBlueprint('Terjadi kesalahan saat membangun cetak biru landing page.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 text-left">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-500 rounded-2xl shadow-lg shadow-violet-900/30">
               <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('landing.title')}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('landing.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="ZenCoffee" icon={Tag} />
            <InputField label={t('common.target_audience')} name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} placeholder="Pekerja WFH Usia 25-40" icon={Target} />
            
            <TextAreaField label={t('landing.advantage')} name="competitiveAdvantage" value={formData.competitiveAdvantage} onChange={handleInputChange} placeholder="Apa yang membedakan produk Anda?" icon={Zap} />
            
            <div className="grid grid-cols-1 gap-4">
              <TextAreaField label={t('landing.problem_angle')} name="problemAngle" value={formData.problemAngle} onChange={handleInputChange} placeholder="Kesulitan yang mereka hadapi..." icon={MessageSquare} />
              <TextAreaField label={t('common.solution')} name="solution" value={formData.solution} onChange={handleInputChange} placeholder="Bagaimana produk Anda membantu..." icon={ShieldCheck} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('common.style')} name="layout" value={formData.layout} onChange={handleInputChange} options={['AIDA', 'PAS', 'Bridge After Bridge']} icon={Layout} />
              <InputField label={t('common.cta')} name="cta" value={formData.cta} onChange={handleInputChange} placeholder="Mulai Sekarang" icon={MousePointer2} />
            </div>

            <TextAreaField label={t('landing.promo')} name="promo" value={formData.promo} onChange={handleInputChange} placeholder="Diskon 50% atau Gratis Ongkir..." icon={Sparkles} />

            <button onClick={handleBuild} disabled={loading} className="w-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white py-5 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-violet-900/30 active:scale-[0.98] mt-4 cursor-pointer">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Layout className="w-6 h-6" />}
              {loading ? t('landing.generating') : t('landing.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('landing.hub_title')}</span>
            </div>
            {blueprint && (
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => { 
                     navigator.clipboard.writeText(blueprint); 
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                   }} 
                   className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer"
                 >
                   <Copy className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" /> 
                   {copied ? 'Blueprint Disalin' : 'Copy Blueprint'}
                 </button>

                 <a 
                   href="https://chat.z.ai/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 group cursor-pointer"
                 >
                   <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> 
                   Render di Z.Ai
                 </a>

                 <button 
                   onClick={() => downloadText('landing-page-blueprint.txt', blueprint)}
                   className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-lg list-none cursor-pointer"
                 >
                   <Download className="w-3.5 h-3.5 text-emerald-400" /> Download
                 </button>
               </div>
            )}
          </div>
          
          <div className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-[#1a0b2e]/20">
            {blueprint ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="whitespace-pre-wrap font-medium text-slate-300 leading-relaxed text-lg prose prose-invert max-w-none">
                  {blueprint}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-8 py-20">
                 <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-xl">
                    {loading ? <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" /> : <Layout className="w-10 h-10 text-indigo-400" />}
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-2xl font-bold text-white tracking-tight">Menunggu Parameter Landing Page</h4>
                   <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                     Lengkapi formulir strategi di sebelah kiri untuk menghasilkan arsitektur landing page berkonversi tinggi.
                   </p>
                 </div>
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-white/[0.03] backdrop-blur-md border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" /> Arsitek LP Active</span>
               <span className="opacity-50">Blueprint Optimization: Enabled</span>
             </div>
             <span className="opacity-50">TIM MARKETING AI Landing Engine Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingBuilder;
