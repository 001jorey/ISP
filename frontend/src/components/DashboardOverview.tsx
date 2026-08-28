import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Wifi, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  Ticket,
  ShieldCheck,
  RefreshCw,
  Gauge,
  UserCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { NetworkTopology3D } from './NetworkTopology3D';
import { RouterTerminal } from './RouterTerminal';
import { SpeedTestModal } from './SpeedTestModal';
import type { DashboardStats } from '../types';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  onRefresh?: () => void;
}

const chartData = [
  { time: '06:00', activations: 12, traffic: 42 },
  { time: '08:00', activations: 28, traffic: 95 },
  { time: '10:00', activations: 45, traffic: 140 },
  { time: '12:00', activations: 62, traffic: 185 },
  { time: '14:00', activations: 80, traffic: 160 },
  { time: '16:00', activations: 104, traffic: 210 },
  { time: '18:00', activations: 135, traffic: 280 },
  { time: '20:00', activations: 158, traffic: 310 },
  { time: '22:00', activations: 180, traffic: 240 },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, onRefresh }) => {
  const navigate = useNavigate();
  const [speedTestOpen, setSpeedTestOpen] = useState(false);

  const pendingCount = stats?.pendingActivations || 2;

  const kpis = [
    {
      title: 'Pending Client Approvals',
      value: pendingCount.toString(),
      sub: '10-Min Grace Active',
      icon: UserCheck,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-md',
      change: 'Action Required',
      onClick: () => navigate('/admin/new-clients')
    },
    {
      title: 'Total Active Subscribers',
      value: stats ? stats.totalUsers.toLocaleString() : '842',
      sub: `${stats ? stats.activeUsers : '628'} approved accounts`,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-neon-emerald',
      change: '+14.2% this month'
    },
    {
      title: 'Live Hotspot & PPPoE Leases',
      value: (stats ? stats.activeSessions : 38).toString(),
      sub: 'MikroTik CCR2004 Cluster',
      icon: Wifi,
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-neon-cyan',
      change: 'Zero packet loss'
    },
    {
      title: 'Network Throughput',
      value: '184.6 Mbps',
      sub: '10G SEACOM Fiber Core',
      icon: Activity,
      color: 'from-indigo-500 to-purple-600',
      glow: 'shadow-neon-purple',
      change: '18% CPU • 41°C stable'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel-emerald rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>KijaniLink ISP Core NOC Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Network Operations Center (NOC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Admin activation workflow: Clients receive 10-minute temporary grace access upon request until you approve their full package.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {pendingCount > 0 && (
            <button
              onClick={() => navigate('/admin/new-clients')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center space-x-2 shadow-lg transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Review {pendingCount} Pending Clients</span>
            </button>
          )}

          <button
            onClick={() => setSpeedTestOpen(true)}
            className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
          >
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Speed Audit</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn-kijani px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center space-x-2 shadow-neon-emerald"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live NOC</span>
          </button>
        </div>
      </div>

      {/* KPI 3D Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            onClick={kpi.onClick}
            className={`glass-panel-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${kpi.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white ${kpi.glow} group-hover:rotate-6 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live
              </span>
            </div>
            <div className="text-2xl font-extrabold font-display text-white tracking-tight">
              {kpi.value}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              {kpi.title}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>{kpi.sub}</span>
              <span className="text-emerald-400 font-semibold">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Live Traffic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Activations & Bandwidth Graph */}
        <div className="lg:col-span-2 glass-panel-card rounded-3xl p-6 border border-white/10 shadow-xl relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Daily Activations & Bandwidth Load</h3>
              <p className="text-xs text-slate-400">Customer activation requests approved & aggregate Mbps throughput</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5" /> Approved Clients
              </span>
              <span className="flex items-center text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-1.5" /> Traffic (Mbps)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTraf" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}
                />
                <Area type="monotone" dataKey="activations" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="traffic" stroke="#06b6d4" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorTraf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="glass-panel-card rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-white mb-4">Quick Operations</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/new-clients')}
                className="w-full p-3.5 rounded-2xl glass-panel border border-amber-500/30 hover:border-amber-400 bg-amber-950/10 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Client Approvals ({pendingCount})
                    </div>
                    <div className="text-[10px] text-slate-400">Approve 10-min grace requests</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/admin/plans')}
                className="w-full p-3.5 rounded-2xl glass-panel border border-white/5 hover:border-emerald-500/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Manage Packages & Speeds</div>
                    <div className="text-[10px] text-slate-400">Configure speed tiers & durations</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/admin/vouchers')}
                className="w-full p-3.5 rounded-2xl glass-panel border border-white/5 hover:border-cyan-500/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Generate Hotspot Vouchers</div>
                    <div className="text-[10px] text-slate-400">Print 3D cards with QR codes</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> RouterOS v7.14.3 API Linked
            </span>
            <span className="font-mono text-cyan-300">192.168.88.1</span>
          </div>
        </div>
      </div>

      {/* 3D Network Topology Map */}
      <NetworkTopology3D />

      {/* MikroTik RouterOS Live Interactive Terminal Console */}
      <RouterTerminal />

      {/* Speed Test Modal */}
      <SpeedTestModal isOpen={speedTestOpen} onClose={() => setSpeedTestOpen(false)} />
    </div>
  );
};

export default DashboardOverview;
