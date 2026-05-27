import { Package } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Futuristic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="z-10 text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/20">
          <Package className="w-12 h-12 text-blue-400 animate-pulse" />
        </div>
        
        <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">World</span>
        </h1>
        
        <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">
          Enterprise Order Suite • System Ready
        </p>
      </div>
    </div>
  );
};

export default HomePage;