import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Phone, Mail, Calendar, Activity, CheckCircle2, XCircle, RefreshCw, Plus, Shield } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { User } from '../types';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages || 1);
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-neon-emerald">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Subscribers & Customer Accounts</h1>
          </div>
          <p className="text-xs text-slate-400">View customer database, registration dates, phone numbers, and payment activity</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone or name..."
            className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Users 3D Table / Card Grid */}
      <div className="glass-panel-card rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <span className="text-xs">Loading subscribers...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-white">No subscribers found</p>
            <p className="text-xs">Try refining your search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/30 to-cyan-500/30 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs">
                          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Hotspot User'}
                          </div>
                          <div className="text-[10px] text-slate-400">{user.email || 'No email attached'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-300 font-medium">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                        user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {formatRelativeTime(user.createdAt)}
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

export default UsersManagement;
