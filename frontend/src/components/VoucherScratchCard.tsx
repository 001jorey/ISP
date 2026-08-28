import React, { useState } from 'react';
import { Ticket, Sparkles, CheckCircle2, ArrowRight, RefreshCw, QrCode } from 'lucide-react';
import { publicAPI } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface VoucherScratchCardProps {
  onSuccess: (sessionToken: string, planName: string) => void;
}

export const VoucherScratchCard: React.FC<VoucherScratchCardProps> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoRevealed, setDemoRevealed] = useState(false);

  const sampleDemoCode = 'KIJANI-9821-SPEED';

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    setLoading(true);
    try {
      const res = await publicAPI.redeemVoucher(code.trim(), phone || undefined);
      if (res.success && res.data) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
        toast.success(res.data.message || 'Voucher redeemed successfully!');
        onSuccess(res.data.sessionToken, res.data.planName);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired voucher code');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPaste = () => {
    setCode(sampleDemoCode);
    setDemoRevealed(true);
    toast.success('Sample voucher code loaded!');
  };

  return (
    <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-neon-emerald">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-white">Redeem Prepaid Voucher</h3>
          <p className="text-xs text-slate-300">Scratch physical card or enter digital voucher PIN</p>
        </div>
      </div>

      {/* 3D Holographic Scratch Card Preview */}
      <div className="mb-6 p-4 rounded-2xl glass-panel-emerald border border-emerald-400/40 relative overflow-hidden holo-shimmer group cursor-pointer" onClick={handleQuickPaste}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase font-display">KIJANILINK ACCESS PASS</span>
          </div>
          <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
            HIGH SPEED WIFI
          </span>
        </div>

        <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Scratch / Voucher PIN</div>
            <div className="text-sm font-bold font-mono tracking-wider text-white">
              {demoRevealed || code ? (code || sampleDemoCode) : '•••• - •••• - ••••'}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickPaste();
            }}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 flex items-center transition-all"
          >
            <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
            {demoRevealed ? 'Revealed' : 'Scratch Sample'}
          </button>
        </div>
      </div>

      <form onSubmit={handleRedeem} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Voucher Code / PIN
          </label>
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. KIJANI-9821-SPEED"
              className="glass-input w-full px-4 py-3 rounded-xl font-mono text-sm tracking-wide uppercase placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Phone Number (Optional - for SMS Receipt)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-kijani w-full py-3.5 rounded-xl font-bold text-white shadow-neon-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Validating & Activating Session...
            </>
          ) : (
            <>
              <span>Connect with Voucher</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
