import React, { useState, useEffect } from 'react';
import { Wifi, Search, Filter, Power, Clock, User, Activity, RefreshCw, Smartphone, Laptop } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatBytes, formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { Session } from '../types';

export const SessionsManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId: string) => {
    if (window.confirm('Disconnect this user from the WiFi hotspot?')) {
      setTerminatingId(sessionId);
      try {
        await adminAPI.terminateSession(sessionId);
        toast.success('Hotspot session disconnected');
        fetchSessions();
      } catch {
        toast.error('Failed to terminate session');
      } finally {
        setTerminatingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-neon-purple">
              <Wifi className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Live Hotspot Client Sessions</h1>
          </div>
          <p className="text-xs text-slate-400">Monitor active DHCP leases, MAC bindings, data consumption & kick unauthorized clients</p>
        </div>

        <button
          onClick={fetchSessions}
          className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Leases</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className="glass-panel-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold font-display text-white">
                  {sess.plan?.name || 'Active Plan'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Subscriber:</span>
                <span className="font-semibold text-white font-mono">{sess.user?.phone || '+254 7XX XXX XXX'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Assigned IP:</span>
                <span className="font-mono text-cyan-400 font-semibold">{sess.ipAddress || '192.168.88.105'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Hardware MAC:</span>
                <span className="font-mono text-slate-400 text-[11px]">{sess.macAddress || 'DC:A6:32:89:12:FA'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Data Transferred:</span>
                <span className="font-mono text-emerald-400 font-bold">{formatBytes(sess.dataUsed)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Started:</span>
                <span className="text-slate-400 text-[11px]">{formatRelativeTime(sess.startTime)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                Token: {sess.sessionToken.slice(0, 12)}...
              </div>
              <button
                onClick={() => handleTerminate(sess.id)}
                disabled={terminatingId === sess.id}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Kick Client</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsManagement;
