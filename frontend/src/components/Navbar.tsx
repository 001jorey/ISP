import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, Gauge, Shield, Globe, LayoutDashboard, UserCheck, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenSpeedTest?: () => void;
  lang?: 'en' | 'sw';
  setLang?: (lang: 'en' | 'sw') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSpeedTest,
  lang = 'en',
  setLang
}) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto glass-panel-emerald rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 border border-emerald-500/20 shadow-xl flex items-center justify-between">
        
        {/* Brand Logo with 3D Leaf + WiFi Prism */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-neon-emerald group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Internal glowing leaf & wifi */}
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
              <Wifi className="w-6 h-6 text-emerald-400 relative z-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                KijaniLink
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                3D ISP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {lang === 'sw' ? 'Unganisha. Lipa. Furahia.' : 'Next-Gen Smart WiFi Ecosystem'}
            </p>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Live Speed Test Trigger */}
          {onOpenSpeedTest && (
            <button
              onClick={onOpenSpeedTest}
              className="glass-pill px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:border-emerald-400/50 flex items-center space-x-1.5 transition-all shadow-sm"
              title="Test real-time bandwidth speed"
            >
              <Gauge className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden md:inline">Speed Test</span>
            </button>
          )}

          {/* Language Switcher */}
          {setLang && (
            <button
              onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
              className="glass-pill px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1 transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono uppercase">{lang === 'en' ? '🇰🇪 SW' : '🇬🇧 EN'}</span>
            </button>
          )}

          {/* Portal Switcher */}
          {isAdmin ? (
            <Link
              to="/"
              className="btn-glass px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5"
            >
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Customer Portal</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="btn-kijani px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center space-x-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
