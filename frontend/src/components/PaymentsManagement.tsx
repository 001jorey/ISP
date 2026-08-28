import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Filter, Download, Calendar, CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { Payment } from '../types';

export const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPayments();
      if (response.success && response.data) {
        setPayments(response.data.payments);
      }
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Customer Phone', 'Plan', 'Amount (KES)', 'M-Pesa Receipt', 'Status', 'Date'],
      ...payments.map((p) => [
        p.id,
        p.user?.phone || 'N/A',
        p.plan?.name || 'N/A',
        p.amount.toString(),
        p.mpesaReceiptNumber || 'N/A',
        p.status,
        new Date(p.createdAt).toLocaleString()
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KijaniLink_MPesa_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded M-Pesa statements CSV');
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      p.mpesaReceiptNumber?.toLowerCase().includes(s) ||
      p.user?.phone?.toLowerCase().includes(s) ||
      p.plan?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-neon-cyan">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">M-Pesa & Financial Transactions</h1>
          </div>
          <p className="text-xs text-slate-400">Audit Safaricom Daraja STK Push callbacks, Paybill receipts & revenue disbursements</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Receipt / phone search..."
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel-card rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <span className="text-xs">Loading transaction records...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-white">No transactions recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Receipt Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan Purchased</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        {pay.mpesaReceiptNumber || 'SHK' + pay.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{pay.user?.phone || '+254 7XX XXX XXX'}</div>
                      <div className="text-[10px] text-slate-400">{pay.user?.firstName || 'M-Pesa Client'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {pay.plan?.name || 'Internet Plan'}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {formatRelativeTime(pay.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsManagement;
