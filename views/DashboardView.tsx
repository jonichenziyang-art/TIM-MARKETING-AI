
import React, { useState } from 'react';
import { 
  Play,
  Users,
  BrainCircuit,
  Layout,
  Camera,
  Rocket,
  Type,
  Video,
  Eye,
  Plus,
  BarChart3,
  MoreHorizontal,
  ShoppingBag,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { AppView } from '../types';

const toolsList: { id: string; title: string; category: string; status: string; icon: any; color: string; bg: string; viewId: AppView }[] = [
  { id: '01', title: 'Strategi Iklan AI', category: 'Planning', status: 'Updated', icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-500/15', viewId: 'strategist' },
  { id: '02', title: 'Pembuat Landing Page', category: 'Web Design', status: 'Popular', icon: Layout, color: 'text-blue-400', bg: 'bg-blue-500/15', viewId: 'landing' },
  { id: '03', title: 'Foto Produk Estetik', category: 'Image Generation', status: 'Pro', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-500/15', viewId: 'product_photo' },
  { id: '04', title: 'Pembuat Gambar Iklan', category: 'Image & Copy', status: 'Updated', icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/15', viewId: 'content' },
  { id: '05', title: 'Penulis Konten AI', category: 'Text Generation', status: 'Popular', icon: Type, color: 'text-indigo-400', bg: 'bg-indigo-500/15', viewId: 'copywriter' },
  { id: '06', title: 'Desain Visi Sinematik', category: 'Image Analysis', status: 'New', icon: Eye, color: 'text-teal-400', bg: 'bg-teal-500/15', viewId: 'vision' },
  { id: '07', title: 'Pusat Konten UGC', category: 'Video Generation', status: 'Trending', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15', viewId: 'ugc' },
  { id: '08', title: 'Pusat Affiliate', category: 'Affiliate Marketing', status: 'New', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/15', viewId: 'affiliate' },
];

const DashboardView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [showTrendingMenu, setShowTrendingMenu] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-700 h-full">
      
      {/* Left Column (Main Content) */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        
        {/* Header Titles */}
        <div className="flex items-end justify-between relative">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">What's hot</p>
            <h1 className="text-4xl font-bold text-white tracking-tight">Trending</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowTrendingMenu(!showTrendingMenu)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showTrendingMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Refresh Trends</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Customize View</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Share Dashboard</button>
              </div>
            )}
          </div>
        </div>

        {/* Trending Banner */}
        <div className="relative rounded-[2rem] p-8 sm:p-10 overflow-hidden shadow-2xl bg-gradient-to-br from-violet-950/80 via-[#0a0e1c] to-emerald-950/70 border border-violet-500/20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[240px]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                <p className="text-white text-[11px] font-bold uppercase tracking-[0.2em]">
                  TIM MARKETING AI
                </p>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] max-w-2xl tracking-tight drop-shadow-lg font-display">
                SUITE INTELIJEN<br />PEMASARAN MODERN
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-8 gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('strategist')}
                  className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-violet-900/30 hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Mulai Workspace
                </button>
                <button 
                  onClick={() => setShowTutorialModal(true)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 text-white px-6 py-3.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:border-violet-500/40"
                >
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Tutorial Pemakaian
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">Instrumen AI</h2>
            <button className="text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors">Semua Fitur</button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex-1 shadow-2xl">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-16">#</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">TITLE</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">CATEGORY</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {toolsList.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <tr 
                        key={tool.id} 
                        onClick={() => onNavigate(tool.viewId)}
                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-slate-500">{tool.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform`}>
                              <Icon className={`w-5 h-5 ${tool.color}`} />
                            </div>
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{tool.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-400">{tool.category}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 group-hover:bg-white/10 transition-colors">
                            {tool.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-8 xl:border-l xl:border-white/5 xl:pl-8">
        
        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Tags</h3>
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Copywriting', 'Video Ads', 'Analytics', 'UGC', 'Design', 'Marketing', 'SEO'].map(tag => (
              <button 
                key={tag}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all hover:scale-105 shadow-lg"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Promo Card */}
        <div 
          className="relative rounded-3xl overflow-hidden h-48 mt-auto group cursor-pointer border border-violet-500/20"
          onClick={() => onNavigate('studio_ai')}
        >
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-[#0a0e1c] to-emerald-900/80 opacity-95 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_50%)] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.6),transparent_50%)]" />
          <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors duration-500" />
          
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase mb-1.5 border border-emerald-500/30">
                  Terintegrasi
                </span>
                <h3 className="text-lg font-extrabold text-white leading-tight drop-shadow-md font-display">
                  TIM MARKETING AI<br/>Studio Orchestrator
                </h3>
                <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider drop-shadow-md">Orkestrator Kampanye Terpadu</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors shrink-0 border border-white/30 shadow-xl group-hover:rotate-90 duration-300">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Tutorial Pemakaian */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e0f17] border border-white/10 rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/15 blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/20">
                      Panduan Resmi
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">TIM MARKETING AI</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                    Tutorial Pemakaian
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowTutorialModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Steps */}
            <div className="relative z-10 py-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
              <p className="text-xs text-slate-300 leading-relaxed">
                Ikuti alur kerja 4 tahap di bawah ini untuk menghasilkan strategi pemasaran, materi kreatif, dan kampanye berkonversi tinggi secara maksimal:
              </p>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-all flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Riset & Strategi Kampanye</h4>
                    <button 
                      onClick={() => { setShowTutorialModal(false); onNavigate('strategist'); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                    >
                      Buka Fitur <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Mulai di menu <strong>Strategi Iklan AI</strong> untuk menganalisis target audiens, menentukan sudut masalah (*angle*), dan menyusun fondasi pesan penawaran utama.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Produksi Copywriting & Naskah</h4>
                    <button 
                      onClick={() => { setShowTutorialModal(false); onNavigate('copywriter'); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      Buka Fitur <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Gunakan <strong>Penulis Konten AI</strong> untuk menghasilkan teks headline viral, formula copywriting (AIDA/PAS), dan naskah video TikTok/Reels.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Visual & Foto Produk AI</h4>
                    <button 
                      onClick={() => { setShowTutorialModal(false); onNavigate('content'); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                    >
                      Buka Fitur <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Beralih ke <strong>Pembuat Gambar Iklan</strong> atau <strong>Foto Produk AI</strong> untuk menghasilkan materi visual realistis berkualitas studio dengan format 1:1, 9:16, atau 16:9.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Landing Page & Audit Iklan</h4>
                    <button 
                      onClick={() => { setShowTutorialModal(false); onNavigate('landing'); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      Buka Fitur <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Lengkapi konversi dengan <strong>Pembuat Landing Page</strong> serta lakukan evaluasi berkala via <strong>Audit Performa Iklan</strong> untuk efisiensi budget.
                  </p>
                </div>
              </div>

              {/* Tips Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-blue-950/40 border border-violet-500/20 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Tips Optimalisasi:</strong> Berikan jeda 1 menit antarproses generate dan gunakan deskripsi produk yang spesifik agar rekomendasi model AI semakin akurat.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowTutorialModal(false);
                  onNavigate('strategist');
                }}
                className="flex-1 bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 hover:from-violet-500 hover:via-blue-500 hover:to-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Mulai dari Langkah 1 (AI Strategist)
              </button>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 px-6 rounded-xl transition-all cursor-pointer text-xs"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
