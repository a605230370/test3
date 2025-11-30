import React, { useState } from 'react';
import { generateImage } from '../services/api';
import { useStore } from '../context/StoreContext';
import { Loader2, Download, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { addWork } = useStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const base64 = await generateImage(prompt, size);
      setResult(base64);
      // Automatically save to feed
      addWork({
        type: 'image',
        url: base64,
        prompt: prompt,
      });
    } catch (error) {
      alert("生成失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Controls */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">
          <div className="mb-6">
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              文生图 Pro
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gemini 3 Pro 模型驱动</p>
          </div>

          <label className="block text-sm font-bold text-slate-700 mb-2">
            创意描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述您想看到的画面细节、光影、风格等..."
            className="w-full flex-1 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base mb-6 bg-slate-50"
          />

          <label className="block text-sm font-bold text-slate-700 mb-2">
            画质设置
          </label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {['1K', '2K', '4K'].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s as any)}
                className={`py-3 text-sm font-medium rounded-xl transition-all border ${
                  size === s
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200/50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在渲染...
              </>
            ) : (
              '立即生成'
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="lg:w-2/3 bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50 pointer-events-none" />
        
        {loading ? (
          <div className="text-center z-10 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">AI 正在构思画面</h3>
            <p className="text-slate-500 text-sm mt-1">Gemini 正在为您绘制每一个像素...</p>
          </div>
        ) : result ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/5">
            <img 
              src={result} 
              alt="Generated" 
              className="max-w-full max-h-full object-contain shadow-2xl" 
            />
            <div className="absolute top-6 left-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-fade-in">
              <CheckCircle className="w-3 h-3" /> 已保存到作品集
            </div>
            <a
              href={result}
              download={`designai-${Date.now()}.png`}
              className="absolute bottom-6 right-6 bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-full shadow-xl transition-transform hover:-translate-y-1 font-medium flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> 下载原图
            </a>
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
               <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">预览区域</p>
          </div>
        )}
      </div>
    </div>
  );
}