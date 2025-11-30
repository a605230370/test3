import React, { useState, useRef } from 'react';
import { generateVeoVideo, fileToBase64 } from '../services/api';
import { useStore } from '../context/StoreContext';
import { Loader2, Video, Upload, Play, CheckCircle } from 'lucide-react';

export default function VeoVideo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addWork } = useStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const base64 = await fileToBase64(file);
      setPreview(`data:${file.type};base64,${base64}`);
      setVideoUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      const base64 = await fileToBase64(selectedFile);
      const url = await generateVeoVideo(base64, selectedFile.type, aspectRatio, prompt);
      setVideoUrl(url);
      // Save to feed
      addWork({
        type: 'video',
        url: url,
        prompt: prompt || 'Image to Video (Veo)',
      });
    } catch (error) {
      alert("视频生成失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-pink-600" />
          图生视频 (Veo)
        </h2>
        <p className="text-slate-500 mt-2">
          上传静态图片，生成电影级动态视频。
          <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">企业版 Pro</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div 
             onClick={() => fileInputRef.current?.click()}
             className="bg-white border-2 border-dashed border-slate-200 p-4 rounded-xl cursor-pointer hover:border-pink-300 hover:bg-pink-50 transition-all text-center min-h-[200px] flex flex-col items-center justify-center"
          >
            {preview ? (
              <img src={preview} alt="Source" className="h-40 w-full object-cover rounded-lg mx-auto" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Upload className="mb-2 w-8 h-8" />
                <span className="font-medium">上传参考图</span>
              </div>
            )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">运动提示词 (可选)</label>
               <input 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="例如：赛博朋克风格，镜头推进..."
                 className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
               />
             </div>
             
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">画面比例</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${aspectRatio === '16:9' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    16:9 (横屏)
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${aspectRatio === '9:16' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    9:16 (竖屏)
                  </button>
                </div>
             </div>

             <button
              onClick={handleGenerate}
              disabled={loading || !selectedFile}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-pink-200"
             >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                生成视频
             </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-black rounded-2xl shadow-2xl h-[500px] flex items-center justify-center relative overflow-hidden group">
             {loading ? (
               <div className="text-center text-white/80 z-10">
                 <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-pink-500" />
                 <p className="font-medium">Veo 正在渲染视频</p>
                 <p className="text-xs mt-2 opacity-60">通常需要 1-2 分钟，请耐心等待</p>
               </div>
             ) : videoUrl ? (
               <>
                 <video controls autoPlay loop className="w-full h-full object-contain">
                   <source src={videoUrl} type="video/mp4" />
                   您的浏览器不支持 video 标签。
                 </video>
                 <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-20">
                    <CheckCircle className="w-3 h-3" /> 已保存
                 </div>
               </>
             ) : (
               <div className="text-white/30 flex flex-col items-center">
                 <Video className="w-16 h-16 mb-4" />
                 <p className="font-medium">视频预览区域</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}