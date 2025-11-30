import React, { useState, useRef } from 'react';
import { editImage, fileToBase64 } from '../services/api';
import { useStore } from '../context/StoreContext';
import { Loader2, Upload, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function ImageEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addWork } = useStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const base64 = await fileToBase64(file);
      setPreview(`data:${file.type};base64,${base64}`);
      setResult(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedFile || !prompt.trim()) return;
    setLoading(true);
    try {
      const base64Data = await fileToBase64(selectedFile);
      const editedImage = await editImage(base64Data, selectedFile.type, prompt);
      setResult(editedImage);
      // Save to feed
      addWork({
        type: 'image',
        url: editedImage,
        prompt: `编辑: ${prompt}`,
      });
    } catch (error) {
      alert("编辑失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          智能修图
        </h2>
        <p className="text-slate-500 mt-2">
          Gemini 2.5 Flash 驱动的自然语言图像编辑。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[300px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all bg-white overflow-hidden relative"
          >
            {preview ? (
              <img src={preview} alt="Original" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-slate-900 font-bold text-lg">点击上传图片</p>
                <p className="text-slate-500 text-sm mt-1">支持 PNG, JPG 格式</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：把背景换成雪山，增加下雪特效..."
              className="flex-1 p-3 pl-4 rounded-xl outline-none text-slate-700 placeholder-slate-400"
            />
            <button
              onClick={handleEdit}
              disabled={loading || !selectedFile || !prompt}
              className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1 min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
           {loading ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">AI 正在施展魔法...</p>
              </div>
            ) : result ? (
              <>
                <img src={result} alt="Result" className="w-full h-full object-contain" />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                   <CheckCircle className="w-3 h-3" /> 已保存
                </div>
              </>
            ) : (
              <p className="text-slate-400 font-medium">修改后的图片将显示在这里</p>
            )}
        </div>
      </div>
    </div>
  );
}