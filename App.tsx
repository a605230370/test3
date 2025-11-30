import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Home from './pages/Home';
import TextToImage from './pages/TextToImage';
import ImageEditor from './pages/ImageEditor';
import VeoVideo from './pages/VeoVideo';
import Inspiration from './pages/Inspiration';
import Login from './pages/Login';
import { LayoutGrid, Image, Palette, Video, Sparkles, LogOut, Hexagon } from 'lucide-react';

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { user, logout } = useStore();
  
  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 shadow-sm z-10">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <Hexagon className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">DesignAI Pro</span>
      </div>
      
      <div className="mb-8 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
        <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white shadow-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.role}</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        <NavLink to="/" icon={<LayoutGrid className="w-5 h-5" />} label="工作台概览" />
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">创作工具</div>
        <NavLink to="/text-to-image" icon={<Image className="w-5 h-5" />} label="文生图 Pro" />
        <NavLink to="/image-editor" icon={<Palette className="w-5 h-5" />} label="智能修图" />
        <NavLink to="/video-generator" icon={<Video className="w-5 h-5" />} label="Veo 视频" />
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">资源</div>
        <NavLink to="/inspiration" icon={<Sparkles className="w-5 h-5" />} label="灵感库" />
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/text-to-image" element={<TextToImage />} />
                    <Route path="/image-editor" element={<ImageEditor />} />
                    <Route path="/video-generator" element={<VeoVideo />} />
                    <Route path="/inspiration" element={<Inspiration />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </StoreProvider>
  );
}