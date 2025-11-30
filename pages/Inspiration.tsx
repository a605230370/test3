import React, { useState } from 'react';
import { getInspiration } from '../services/api';
import { InspirationItem } from '../types';
import { Loader2, Search, ExternalLink, Lightbulb } from 'lucide-react';

export default function Inspiration() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ ideas: InspirationItem[]; urls: { title: string; uri: string }[] } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await getInspiration(query);
      setData(result);
    } catch (error) {
      alert("搜索失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <Lightbulb className="text-amber-500 w-8 h-8" />
          灵感探索
        </h2>
        <p className="text-slate-600">
          基于 Google Search 实时数据，为您提供最新的设计趋势与创意构思。
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例如：2025年夏季运动鞋广告设计趋势..."
          className="w-full p-4 pl-12 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <button
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '搜索'}
        </button>
      </form>

      {data && (
        <div className="space-y-10 animate-fade-in">
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-indigo-500 pl-4">
              创意提案
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.ideas.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl font-black text-slate-100 mb-4">0{idx + 1}</div>
                  <h4 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          {data.urls.length > 0 && (
            <section className="bg-slate-50 p-6 rounded-2xl">
               <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                 <ExternalLink className="w-5 h-5" />
                 参考来源
               </h3>
               <div className="flex flex-wrap gap-3">
                 {data.urls.map((url, idx) => (
                   <a
                    key={idx}
                    href={url.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-indigo-600 hover:border-indigo-300 transition-colors truncate max-w-xs"
                   >
                     <span className="truncate">{url.title}</span>
                   </a>
                 ))}
               </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
