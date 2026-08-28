import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Wifi, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FloatingBackground3D } from '../components/FloatingBackground3D';
import toast from 'react-hot-toast';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@kijanilink.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemoAdmin, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back, Admin!');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch {
      toast.error('Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoAdmin();
    toast.success('Signed in as KijaniLink Super Admin');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <FloatingBackground3D />

      <div className="relative w-full max-w-md z-10">
        
        {/* 3D Glass Login Card */}
        <div className="glass-panel-emerald rounded-[36px] p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-neon-emerald group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </Link>

            <h1 className="text-2xl font-extrabold font-display text-white">
              KijaniLink NOC Login
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Network Operations & WiFi Hotspot Gateway Control
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kijanilink.com"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-kijani w-full py-3.5 rounded-2xl font-bold text-white shadow-neon-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter NOC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Instant Demo Access */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-2xl glass-panel border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold text-emerald-300 hover:text-white flex items-center justify-center space-x-2 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
              <span>1-Click Instant Demo Login</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Default credentials: <span className="text-emerald-400 font-mono">admin@kijanilink.com</span> / <span className="text-emerald-400 font-mono">admin123</span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to Customer Hotspot Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
