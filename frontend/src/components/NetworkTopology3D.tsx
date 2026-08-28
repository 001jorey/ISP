import React, { useState } from 'react';
import { Server, Wifi, Globe, Smartphone, Laptop, Radio, Activity, CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';

export const NetworkTopology3D: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('router');

  const nodes = [
    {
      id: 'isp',
      title: 'Tier-1 Fiber Uplink',
      type: 'gateway',
      icon: Globe,
      status: 'Active (10 Gbps)',
      ping: '1.2ms',
      detail: 'Safaricom / SEACOM Redundant Ring'
    },
    {
      id: 'router',
      title: 'MikroTik CCR2004 Core Edge',
      type: 'core',
      icon: Server,
      status: 'Online • 18% CPU',
      ping: '0.4ms',
      detail: 'KijaniLink Gateway Router & Hotspot Server'
    },
    {
      id: 'ap1',
      title: 'Sector North (5GHz)',
      type: 'ap',
      icon: Radio,
      status: '18 Active Clients',
      ping: '4ms',
      detail: 'MikroTik mANTBox 19s (Channel 36 / 80MHz)'
    },
    {
      id: 'ap2',
      title: 'Sector Central (5GHz)',
      type: 'ap',
      icon: Radio,
      status: '32 Active Clients',
      ping: '3ms',
      detail: 'Ubiquiti Rocket Prism 5AC (Channel 149)'
    },
    {
      id: 'ap3',
      title: 'Sector South (5GHz)',
      type: 'ap',
      icon: Radio,
      status: '24 Active Clients',
      ping: '5ms',
      detail: 'MikroTik NetMetal ax 6GHz Ready'
    }
  ];

  return (
    <div className="glass-panel-emerald rounded-3xl p-6 border border-emerald-500/20 shadow-xl overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-xl font-bold font-display text-white">Live 3D Network Topology</h3>
          </div>
          <p className="text-xs text-emerald-300/80 mt-1">Real-time packet propagation & mesh routing cluster</p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="glass-pill px-3 py-1.5 rounded-xl text-emerald-300 font-mono flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Total Traffic: 184.6 Mbps
          </span>
        </div>
      </div>

      {/* Interactive Topology Graph Visualizer */}
      <div className="relative py-6 px-2 min-h-[280px] flex flex-col justify-between">
        
        {/* Connection Pulse Lines */}
        <div className="absolute inset-x-8 top-12 bottom-12 border-dashed border-2 border-emerald-500/20 rounded-3xl pointer-events-none" />

        {/* Level 1: Internet Gateway & Core Router */}
        <div className="flex items-center justify-center space-x-8 relative z-10">
          <button
            onClick={() => setActiveNode('isp')}
            className={`p-4 rounded-2xl glass-panel border transition-all duration-300 text-center group ${
              activeNode === 'isp' ? 'border-cyan-400/80 shadow-neon-cyan scale-105' : 'border-white/10 hover:border-cyan-500/40'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Tier-1 Fiber</div>
            <div className="text-[10px] text-cyan-300">10G Core Link</div>
          </button>

          <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 relative overflow-hidden">
            <div className="w-4 h-full bg-white animate-shimmer" />
          </div>

          <button
            onClick={() => setActiveNode('router')}
            className={`p-4 rounded-2xl glass-panel-emerald border transition-all duration-300 text-center group ${
              activeNode === 'router' ? 'border-emerald-400 shadow-neon-emerald scale-105' : 'border-emerald-500/30 hover:border-emerald-400/60'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white mb-2 shadow-neon-emerald group-hover:scale-110 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-white">MikroTik CCR2004</div>
            <div className="text-[10px] text-emerald-400">Core ISP Gateway</div>
          </button>
        </div>

        {/* Level 2: Sector APs */}
        <div className="grid grid-cols-3 gap-4 mt-8 relative z-10">
          {['ap1', 'ap2', 'ap3'].map((apId, idx) => {
            const apData = nodes.find(n => n.id === apId)!;
            const isSelected = activeNode === apId;
            return (
              <button
                key={apId}
                onClick={() => setActiveNode(apId)}
                className={`p-3.5 rounded-2xl glass-panel border transition-all duration-300 text-center group ${
                  isSelected ? 'border-emerald-400 shadow-neon-emerald scale-105 bg-emerald-950/40' : 'border-white/10 hover:border-emerald-400/40'
                }`}
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white truncate">{apData.title}</div>
                <div className="text-[10px] text-emerald-300/80 font-mono">{apData.status}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Card */}
      {activeNode && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-black/20 p-3 rounded-2xl">
          {(() => {
            const current = nodes.find(n => n.id === activeNode);
            if (!current) return null;
            return (
              <>
                <div>
                  <span className="font-bold text-white mr-2">{current.title}</span>
                  <span className="text-slate-400">{current.detail}</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-400 font-mono">
                  <span>Latency: {current.ping}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300 font-semibold">{current.status}</span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
