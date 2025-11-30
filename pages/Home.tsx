import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Sparkles, Image as ImageIcon, Video, Palette, Clock, Trash2 } from 'lucide-react';

const QuickAction = ({ title, icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      {icon}
    </div>
    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">{title}</span>
  </button>
);

const WorkCard = ({ work, onDelete }: { work: any, onDelete: (id: string) => void }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
      <div className="relative aspect-auto">
        {work.type === 'video' ? (
          <video 
            src={work.url} 
            className="w-full h-full object-cover" 
            controls 
            preload="metadata"
          />
        ) : (
          <img 
            src={work.url} 
            alt={work.prompt} 
            className="w-full h-auto object-cover block"
          />
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(work.id); }}
            className="p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-white text-xs font-medium uppercase">
          {work.type === 'video' ? 'Video' : 'Image'}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed mb-3">
          "{work.prompt}"
        </p>
        <div className="flex items-center text-xs text-slate-400">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(work.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user, works, deleteWork } = useStore();

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header & Quick Actions */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              欢迎回来, <span className="text-indigo-600">{user?.name}</span>
            </h1>
            <p className="text-slate-500 mt-1">准备好开始今天的创作了吗？</p>
          </div>
          <button 
             onClick={() => navigate('/inspiration')}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            获取灵感
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction 
            title="文生图 Pro" 
            icon={<ImageIcon className="w-6 h-6" />} 
            color="bg-blue-500"
            onClick={() => navigate('/text-to-image')}
          />
          <QuickAction 
            title="智能修图" 
            icon={<Palette className="w-6 h-6" />} 
            color="bg-purple-500"
            onClick={() => navigate('/image-editor')}
          />
          <QuickAction 
            title="图片转视频" 
            icon={<Video className="w-6 h-6" />} 
            color="bg-pink-500"
            onClick={() => navigate('/video-generator')}
          />
          <QuickAction 
            title="查看灵感" 
            icon={<Sparkles className="w-6 h-6" />} 
            color="bg-amber-500"
            onClick={() => navigate('/inspiration')}
          />
        </div>
      </section>

      {/* Main Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            我的创意流
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{works.length}</span>
          </h2>
        </div>
        
        {works.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {works.map((work) => (
              <div key={work.id} className="break-inside-avoid">
                <WorkCard work={work} onDelete={deleteWork} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">暂无创作记录</h3>
            <p className="text-slate-500 mb-6">您生成的所有图片和视频都会展示在这里</p>
            <button 
              onClick={() => navigate('/text-to-image')}
              className="text-indigo-600 font-medium hover:underline"
            >
              立即去创作 &rarr;
            </button>
          </div>
        )}
      </section>
    </div>
  );
}