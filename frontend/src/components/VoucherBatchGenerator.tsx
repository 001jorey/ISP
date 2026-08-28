import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Printer, Download, Sparkles, Check, RefreshCw, Copy } from 'lucide-react';
import { adminAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { Plan, Voucher } from '../types';

export const VoucherBatchGenerator: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [batchCount, setBatchCount] = useState<number>(6);
  const [prefix, setPrefix] = useState<string>('KIJANI');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [plansRes, vchRes] = await Promise.all([
        adminAPI.getPlans(),
        adminAPI.getVouchers()
      ]);
      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
        if (plansRes.data.length > 0) setSelectedPlanId(plansRes.data[0].id);
      }
      if (vchRes.success && vchRes.data) {
        setVouchers(vchRes.data);
      }
    } catch {
      toast.error('Failed to load voucher data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setGenerating(true);
    try {
      const res = await adminAPI.generateVouchers({
        planId: selectedPlanId,
        count: batchCount,
        prefix: prefix.trim() || 'KIJANI'
      });
      if (res.success && res.data) {
        toast.success(`Generated ${res.data.length} vouchers successfully!`);
        setVouchers((prev) => [...res.data!, ...prev]);
      }
    } catch {
      toast.error('Failed to generate vouchers');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  return (
    <div className="space-y-6">
      {/* Batch Generator Config Panel */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-neon-emerald">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">3D Holographic Voucher Generator</h2>
              <p className="text-xs text-slate-400">Generate, customize & print prepaid hotspot scratch cards with QR codes</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Batch Cards</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="glass-input w-full px-3 py-2.5 rounded-xl text-xs bg-slate-900 text-white"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} — {formatCurrency(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity</label>
            <input
              type="number"
              min={1}
              max={50}
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="glass-input w-full px-3 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prefix</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="KIJANI"
              className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-mono uppercase"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="btn-kijani w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate Batch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3D Holographic Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map((vch) => (
          <div
            key={vch.id}
            className="glass-panel-emerald rounded-3xl p-5 border border-emerald-400/40 relative overflow-hidden holo-shimmer hover:scale-[1.02] transition-transform duration-300 shadow-xl"
          >
            {/* Holographic Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-neon-emerald" />
                <span className="text-xs font-bold font-display text-white tracking-wider">KIJANILINK WIFI</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                vch.isRedeemed ? 'bg-red-500/20 text-red-300' : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                {vch.isRedeemed ? 'REDEEMED' : 'ACTIVE'}
              </span>
            </div>

            {/* Middle Section: QR + Code Info */}
            <div className="my-4 flex items-center space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-md">
                <QRCodeSVG value={`https://kijanilink.co.ke/portal?v=${vch.code}`} size={64} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                  {vch.plan?.name || 'High Speed WiFi'}
                </div>
                <div className="text-lg font-extrabold text-emerald-400 font-display">
                  {formatCurrency(vch.amount || 20)}
                </div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  Speed: {vch.plan?.speedLimit || '25 Mbps'}
                </div>
              </div>
            </div>

            {/* Voucher Code PIN Bar */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-white/10 flex items-center justify-between">
              <div className="font-mono text-xs font-bold tracking-wider text-white">
                {vch.code}
              </div>
              <button
                onClick={() => copyCode(vch.code)}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Scan QR or enter PIN on portal</span>
              <span>Exp: 30 Days</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
