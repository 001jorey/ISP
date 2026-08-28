import React, { useState } from 'react';
import { Terminal, Send, RefreshCw, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export const RouterTerminal: React.FC = () => {
  const [command, setCommand] = useState('/ip hotspot user print');
  const [history, setHistory] = useState<Array<{ cmd: string; out: string; time: string }>>([
    {
      cmd: '/system resource print',
      out: `                   uptime: 14d08h32m19s
                  version: 7.14.3 (stable)
              free-memory: 3498.2MiB
             total-memory: 4096.0MiB
                      cpu: ARM64 4-Core @ 2000MHz
                 cpu-load: 18%
               board-name: CCR2004-16G-2S+`,
      time: '12:40:02'
    },
    {
      cmd: '/ip hotspot user print',
      out: `Flags: X - disabled, D - dynamic, B - bypass 
 #    NAME                  PROFILE       UPTIME    BYTES-IN   BYTES-OUT
 0 D  +254712345678         plan-1hr      25m12s    485.2MB    112.4MB
 1 D  +254723456789         plan-7day     8h14m     3.82GB     640.1MB
 2 D  guest_guest_9921      plan-1hr      12m40s    120.5MB     24.1MB`,
      time: '12:42:15'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickCommands = [
    '/ip hotspot user print',
    '/ip hotspot active print',
    '/system resource print',
    '/interface print',
    '/ping 8.8.8.8 count=3'
  ];

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    const cmdToRun = command.trim();
    try {
      const res = await adminAPI.executeRouterCommand(cmdToRun);
      const timeStr = new Date().toTimeString().split(' ')[0];
      setHistory((prev) => [
        ...prev,
        {
          cmd: cmdToRun,
          out: res.data?.output || 'Command executed successfully.',
          time: timeStr
        }
      ]);
    } catch {
      toast.error('Command failed to execute');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied terminal output');
  };

  return (
    <div className="glass-panel-card rounded-3xl p-6 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-neon-emerald">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">RouterOS Live Terminal Console</h3>
            <p className="text-xs text-slate-400">admin@KijaniLink-CCR2004 • RouterOS v7.14.3</p>
          </div>
        </div>
        
        {/* Quick command buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickCommands.map((qc) => (
            <button
              key={qc}
              onClick={() => {
                setCommand(qc);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900/80 hover:bg-emerald-600/30 text-slate-300 hover:text-white border border-white/10 font-mono transition-colors"
            >
              {qc.split(' ')[1] || qc}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Screen Window */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-emerald-400 max-h-80 overflow-y-auto space-y-4 shadow-inner">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800/60 pb-0.5">
              <span>
                <span className="text-cyan-400">[admin@KijaniLink]</span> &gt; {item.cmd}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500">{item.time}</span>
                <button
                  onClick={() => copyToClipboard(item.out)}
                  className="hover:text-white p-1 rounded"
                  title="Copy output"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed pl-2 font-mono text-[11px]">
              {item.out}
            </pre>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-cyan-400">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Processing command on CCR2004 edge router...</span>
          </div>
        )}
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleExecute} className="mt-4 flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="/ip hotspot user print"
            className="glass-input w-full pl-8 pr-4 py-2.5 rounded-xl text-xs font-mono text-white placeholder:text-slate-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs">&gt;</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-kijani px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Run</span>
        </button>
      </form>
    </div>
  );
};
