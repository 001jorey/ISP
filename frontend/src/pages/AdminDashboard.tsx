import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wifi, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Ticket, 
  RefreshCw, 
  Gauge, 
  UserCheck, 
  DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { FloatingBackground3D } from '../components/FloatingBackground3D';
import { SpeedTestModal } from '../components/SpeedTestModal';
import toast from 'react-hot-toast';
import type { DashboardStats } from '../types';

// Dashboard components
import DashboardOverview from '../components/DashboardOverview';
import NewClientsManagement from '../components/NewClientsManagement';
import UsersManagement from '../components/UsersManagement';
import PlansManagement from '../components/PlansManagement';
import SessionsManagement from '../components/SessionsManagement';
import PaymentsManagement from '../components/PaymentsManagement';
import SettingsPage from '../components/SettingsPage';
import { VoucherBatchGenerator } from '../components/VoucherBatchGenerator';

export const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [speedTestOpen, setSpeedTestOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(() => fetchDashboardStats(false), 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const response = await adminAPI.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      // Ignore
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  };

  const pendingCount = stats?.pendingActivations || 2;

  const navigation = [
    { name: 'NOC Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'New Clients & Approvals', href: '/admin/new-clients', icon: UserCheck, badge: pendingCount > 0 ? pendingCount : undefined },
    { name: 'Subscribers Database', href: '/admin/users', icon: Users },
    { name: 'Packages & Tiers', href: '/admin/plans', icon: CreditCard },
    { name: 'Active Sessions', href: '/admin/sessions', icon: Wifi },
    { name: 'Voucher Studio', href: '/admin/vouchers', icon: Ticket },
    { name: 'Activation Ledger', href: '/admin/payments', icon: DollarSign },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen relative text-slate-100 flex flex-col lg:flex-row">
      {/* 3D Background */}
      <FloatingBackground3D />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-neon-emerald group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold font-display bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  KijaniLink
                </span>
                <p className="text-[10px] text-emerald-400 font-mono">NOC Admin v2.4</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 mx-4 my-4 rounded-2xl glass-panel-emerald border border-emerald-500/20 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-neon-emerald">
              {(user?.firstName || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Kijani Administrator'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">admin@kijanilink.com</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-neon-emerald scale-[1.02]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-3 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Wifi className="w-4 h-4 mr-3 text-emerald-400" />
            <span>Open Customer Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span className="text-white font-bold">NOC Dashboard</span>
              <span>/</span>
              <span className="text-emerald-400 capitalize">{location.pathname.replace('/admin/', '').replace('/admin', 'Overview')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {stats && (
              <div className="hidden md:flex items-center space-x-2 text-xs">
                <Link to="/admin/new-clients" className="glass-pill px-3 py-1.5 rounded-xl text-amber-300 font-mono flex items-center hover:border-amber-400/50">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" />
                  {pendingCount} Pending Requests
                </Link>
                <div className="glass-pill px-3 py-1.5 rounded-xl text-emerald-300 font-mono flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Today: {formatCurrency(stats.todayRevenue)}
                </div>
              </div>
            )}

            <button
              onClick={() => setSpeedTestOpen(true)}
              className="glass-pill p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs text-slate-200 hover:text-white flex items-center space-x-1.5"
              title="Speed Test"
            >
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Speed Test</span>
            </button>

            <button
              onClick={() => fetchDashboardStats(true)}
              disabled={refreshing}
              className="glass-pill p-2 rounded-xl text-slate-300 hover:text-white disabled:opacity-50"
              title="Refresh NOC"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview stats={stats} onRefresh={() => fetchDashboardStats(true)} />} />
            <Route path="/new-clients" element={<NewClientsManagement />} />
            <Route path="/activations" element={<NewClientsManagement />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/plans" element={<PlansManagement />} />
            <Route path="/sessions" element={<SessionsManagement />} />
            <Route path="/vouchers" element={<VoucherBatchGenerator />} />
            <Route path="/payments" element={<PaymentsManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <SpeedTestModal isOpen={speedTestOpen} onClose={() => setSpeedTestOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
