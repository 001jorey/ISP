import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  Server, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  PlusCircle,
  Timer
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatCurrency, formatDuration, formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import type { ClientActivationRequest } from '../types';

export const NewClientsManagement: React.FC = () => {
  const [activations, setActivations] = useState<ClientActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_APPROVAL');
  const [connectionFilter, setConnectionFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivations();
    const interval = setInterval(fetchActivations, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, connectionFilter]);

  const fetchActivations = async () => {
    try {
      const res = await adminAPI.getActivations({
        status: statusFilter,
        connectionType: connectionFilter
      });
      if (res.success && res.data) {
        setActivations(res.data);
      }
    } catch {
      // Ignore poll error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      const res = await adminAPI.approveActivation(id);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.success(`Approved ${name}! Full package activated.`);
        fetchActivations();
      }
    } catch {
      toast.error('Failed to approve client');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to decline connection for ${name}?`)) {
      setProcessingId(id);
      try {
        await adminAPI.rejectActivation(id);
        toast.success(`Rejected ${name}`);
        fetchActivations();
      } catch {
        toast.error('Failed to reject client');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleExtendGrace = async (id: string) => {
    try {
      await adminAPI.extendGracePeriod(id);
      toast.success('Extended grace period by +10 minutes');
      fetchActivations();
    } catch {
      toast.error('Failed to extend grace period');
    }
  };

  // Helper to calculate remaining grace minutes
  const getRemainingGrace = (graceExpiresAt: string) => {
    const diffMs = new Date(graceExpiresAt).getTime() - Date.now();
    if (diffMs <= 0) return '00:00 (Expired)';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`;
  };

  const pendingCount = activations.filter(a => a.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-neon-emerald">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold font-display text-white">Client Approvals & Activations</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Clients get instant 10-min temporary grace access upon selecting a package. Approve them to unlock their full duration.
          </p>
        </div>

        <button
          onClick={fetchActivations}
          className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'PENDING_APPROVAL', label: '⏳ Pending Approval (10m Grace)' },
            { id: 'APPROVED', label: '✅ Approved & Running' },
            { id: 'ALL', label: 'All Requests' },
            { id: 'REJECTED', label: 'Declined' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-neon-emerald'
                  : 'glass-panel text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Connection Type Dropdown Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Mode:</span>
          <select
            value={connectionFilter}
            onChange={(e) => setConnectionFilter(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 text-white"
          >
            <option value="ALL">All Connections</option>
            <option value="HOTSPOT">Hotspot (WiFi)</option>
            <option value="PPPOE">PPPoE (Fiber/CPE)</option>
          </select>
        </div>
      </div>

      {/* Activations 3D Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-panel-card rounded-3xl">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-xs">Fetching client requests...</p>
        </div>
      ) : activations.length === 0 ? (
        <div className="p-12 text-center text-slate-400 glass-panel-card rounded-3xl border border-white/10">
          <UserCheck className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-white">No requests found</h3>
          <p className="text-xs text-slate-400">There are no client requests under this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activations.map((act) => {
            const isPending = act.status === 'PENDING_APPROVAL';
            const isApproved = act.status === 'APPROVED';
            const isRejected = act.status === 'REJECTED';

            return (
              <div
                key={act.id}
                className={`glass-panel-card rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isPending
                    ? 'border-amber-500/40 bg-amber-950/10 shadow-lg'
                    : isApproved
                    ? 'border-emerald-500/40 bg-emerald-950/10 shadow-lg'
                    : 'border-white/10'
                }`}
              >
                <div>
                  {/* Card Top: Client info & Status */}
                  <div className="flex items-start justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-md ${
                        act.connectionType === 'PPPOE'
                          ? 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                          : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                      }`}>
                        {act.fullName ? act.fullName[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="text-base font-bold font-display text-white">{act.fullName}</div>
                        <div className="text-xs text-emerald-400 font-mono flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {act.phone}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Requested Package & Connection Specs */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 rounded-2xl p-4 mb-4 border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Requested Package</span>
                      <div className="font-bold text-white font-display text-sm mt-0.5">
                        {act.plan?.name || 'Internet Plan'}
                      </div>
                      <div className="text-emerald-400 font-extrabold font-mono mt-0.5">
                        {formatCurrency(act.plan?.price || 150)} • {act.plan?.speedLimit || '25 Mbps'}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Connection Mode</span>
                      <div className="font-bold text-cyan-300 flex items-center mt-0.5">
                        {act.connectionType === 'PPPOE' ? (
                          <>
                            <Server className="w-3.5 h-3.5 mr-1" /> PPPoE Fiber
                          </>
                        ) : (
                          <>
                            <Wifi className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Hotspot MAC
                          </>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono truncate mt-0.5">
                        {act.connectionType === 'PPPOE'
                          ? `User: ${act.pppoeUsername || act.phone}`
                          : `MAC: ${act.macAddress}`}
                      </div>
                    </div>
                  </div>

                  {/* Location and Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      <span>Location: <strong className="text-white">{act.location || 'Hotspot Zone'}</strong></span>
                    </div>

                    {/* Grace Period Timer Display */}
                    {isPending && (
                      <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-amber-300">
                          <Timer className="w-4 h-4 animate-spin text-amber-400" />
                          <span>10-Min Temporary Grace Timer:</span>
                        </div>
                        <span className="font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                          {getRemainingGrace(act.graceExpiresAt)}
                        </span>
                      </div>
                    )}

                    {isApproved && (
                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                        <span className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Full Package Active
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          Expires: {new Date(act.fullExpiresAt || Date.now()).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400">
                    Requested: {formatRelativeTime(act.createdAt)}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleExtendGrace(act.id)}
                          className="px-3 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Add 10 more minutes grace time"
                        >
                          +10m Grace
                        </button>

                        <button
                          onClick={() => handleReject(act.id, act.fullName)}
                          disabled={processingId === act.id}
                          className="px-3 py-2 rounded-xl text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>

                        <button
                          onClick={() => handleApprove(act.id, act.fullName)}
                          disabled={processingId === act.id}
                          className="btn-kijani px-4 py-2 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Full Package</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleReject(act.id, act.fullName)}
                        className="px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewClientsManagement;
