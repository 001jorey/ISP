import React, { useState } from 'react';
import { Settings, Wifi, DollarSign, Bell, Shield, Database, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      systemName: 'KijaniLink',
      companyName: 'KijaniLink Broadband Networks Ltd',
      supportEmail: 'support@kijanilink.co.ke',
      supportPhone: '+254 700 000 001',
      timezone: 'Africa/Nairobi'
    },
    mpesa: {
      consumerKey: '****************************',
      consumerSecret: '****************************',
      shortcode: '174379',
      passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      environment: 'sandbox'
    },
    router: {
      host: '192.168.88.1',
      username: 'admin',
      password: '••••••••',
      port: '8728'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      paymentAlerts: true,
      sessionAlerts: true
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'mpesa', name: 'M-Pesa Daraja', icon: DollarSign },
    { id: 'router', name: 'MikroTik RouterOS', icon: Wifi },
    { id: 'notifications', name: 'SMS & Alerts', icon: Bell }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuration saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-neon-emerald">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">System Configuration</h1>
          </div>
          <p className="text-xs text-slate-400">Manage Safaricom Daraja API credentials, RouterOS connection parameters, and SMS gateways</p>
        </div>

        <button
          onClick={handleSave}
          className="btn-kijani px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-neon-emerald'
                  : 'glass-panel text-slate-300 hover:text-white border border-white/5 hover:border-emerald-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Body */}
      <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">System Name</label>
                <input
                  type="text"
                  value={settings.general.systemName}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, systemName: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Company Legal Name</label>
                <input
                  type="text"
                  value={settings.general.companyName}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Support Hotline Phone</label>
                <input
                  type="text"
                  value={settings.general.supportPhone}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportPhone: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Support Email Address</label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
            </div>
          )}

          {activeTab === 'mpesa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">M-Pesa Business Shortcode / Paybill</label>
                <input
                  type="text"
                  value={settings.mpesa.shortcode}
                  onChange={(e) => setSettings({ ...settings, mpesa: { ...settings.mpesa, shortcode: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Daraja Environment</label>
                <select
                  value={settings.mpesa.environment}
                  onChange={(e) => setSettings({ ...settings, mpesa: { ...settings.mpesa, environment: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl bg-slate-900 text-white"
                >
                  <option value="sandbox">Sandbox (Development)</option>
                  <option value="production">Live Production (Safaricom)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Consumer Key</label>
                <input
                  type="password"
                  value={settings.mpesa.consumerKey}
                  onChange={(e) => setSettings({ ...settings, mpesa: { ...settings.mpesa, consumerKey: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Consumer Secret</label>
                <input
                  type="password"
                  value={settings.mpesa.consumerSecret}
                  onChange={(e) => setSettings({ ...settings, mpesa: { ...settings.mpesa, consumerSecret: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'router' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">MikroTik Router Host IP</label>
                <input
                  type="text"
                  value={settings.router.host}
                  onChange={(e) => setSettings({ ...settings, router: { ...settings.router, host: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">API Port (Default: 8728 / SSL 8729)</label>
                <input
                  type="text"
                  value={settings.router.port}
                  onChange={(e) => setSettings({ ...settings, router: { ...settings.router, port: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">API Admin Username</label>
                <input
                  type="text"
                  value={settings.router.username}
                  onChange={(e) => setSettings({ ...settings, router: { ...settings.router, username: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">API Admin Password</label>
                <input
                  type="password"
                  value={settings.router.password}
                  onChange={(e) => setSettings({ ...settings, router: { ...settings.router, password: e.target.value } })}
                  className="glass-input w-full px-3 py-2.5 rounded-xl"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3.5 glass-panel rounded-2xl border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                />
                <div>
                  <div className="font-semibold text-white">SMS Payment Confirmations</div>
                  <div className="text-[11px] text-slate-400">Send instant SMS receipt with session token upon successful M-Pesa push</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3.5 glass-panel rounded-2xl border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.sessionAlerts}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sessionAlerts: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                />
                <div>
                  <div className="font-semibold text-white">Session Expiration Warnings</div>
                  <div className="text-[11px] text-slate-400">Alert subscribers via SMS 5 minutes before their bandwidth pass expires</div>
                </div>
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="btn-kijani px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-neon-emerald flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
