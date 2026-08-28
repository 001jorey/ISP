import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Check, 
  Clock, 
  Zap, 
  CreditCard, 
  Download, 
  Upload, 
  DollarSign, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Gauge, 
  Radio, 
  Ticket, 
  RefreshCw, 
  HelpCircle,
  Headphones
} from 'lucide-react';
import { formatCurrency, formatDuration, isValidKenyanPhone, formatKenyanPhone } from '../utils/formatters';
import { publicAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { FloatingBackground3D } from '../components/FloatingBackground3D';
import { SpeedTestModal } from '../components/SpeedTestModal';
import { MpesaPhoneSimulator } from '../components/MpesaPhoneSimulator';
import { VoucherScratchCard } from '../components/VoucherScratchCard';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import type { Plan, PaymentStatusResponse } from '../types';

export const CustomerPortal: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPhoneSimulator, setShowPhoneSimulator] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'voucher' | 'speed' | 'faq'>('plans');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    token: string;
    planName: string;
    speedLimit: string;
    expiresAt: string;
  } | null>(null);
  const [lang, setLang] = useState<'en' | 'sw'>('en');

  useEffect(() => {
    fetchPlans();
    // Check if session token saved in storage
    const savedTok = localStorage.getItem('kijani_active_session');
    if (savedTok) {
      try {
        const parsed = JSON.parse(savedTok);
        setActiveSession(parsed);
      } catch {
        // Ignore
      }
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await publicAPI.getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch {
      toast.error('Failed to load internet plans');
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!isValidKenyanPhone(phoneNumber)) {
      toast.error(lang === 'sw' ? 'Tafadhali weka nambari sahihi ya M-Pesa' : 'Please enter a valid Kenyan Safaricom phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await publicAPI.makePayment({
        phone: phoneNumber,
        amount: selectedPlan.price,
        planId: selectedPlan.id
      });

      if (response.success && response.data) {
        setShowPaymentModal(false);
        setShowPhoneSimulator(true);
        toast.success(lang === 'sw' ? 'Ombi la M-Pesa limetumwa kwenye simu yako' : 'M-Pesa STK Push sent to your phone!');
      }
    } catch {
      setShowPaymentModal(false);
      setShowPhoneSimulator(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPhoneSimulator(false);
    const sessionObj = {
      token: 'kj_live_' + Date.now(),
      planName: selectedPlan?.name || 'High Speed WiFi Pass',
      speedLimit: selectedPlan?.speedLimit || '35 Mbps',
      expiresAt: new Date(Date.now() + 3600000 * (selectedPlan?.duration || 24)).toISOString()
    };
    setActiveSession(sessionObj);
    localStorage.setItem('kijani_active_session', JSON.stringify(sessionObj));

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    toast.success(lang === 'sw' ? 'Hongera! Umeunganishwa kwenye intaneti.' : 'Connected to KijaniLink Ultra-Fast WiFi!');
  };

  const handleVoucherSuccess = (sessionToken: string, planName: string) => {
    const sessionObj = {
      token: sessionToken,
      planName,
      speedLimit: '50 Mbps',
      expiresAt: new Date(Date.now() + 3600000 * 24).toISOString()
    };
    setActiveSession(sessionObj);
    localStorage.setItem('kijani_active_session', JSON.stringify(sessionObj));
    setActiveTab('plans');
  };

  const handleDisconnect = () => {
    setActiveSession(null);
    localStorage.removeItem('kijani_active_session');
    toast.success('Disconnected from session');
  };

  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* 3D Floating Canvas Background */}
      <FloatingBackground3D />

      {/* Top Navbar */}
      <Navbar
        onOpenSpeedTest={() => setShowSpeedTest(true)}
        lang={lang}
        setLang={setLang}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-10 text-center relative z-10">
        
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass-panel-emerald text-xs font-semibold mb-6 border border-emerald-400/40 shadow-neon-emerald animate-float-slow">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300">
            {activeSession ? (
              <span>{lang === 'sw' ? 'Umeunganishwa kikamilifu' : 'Status: Connected & High-Speed Online'}</span>
            ) : (
              <span>{lang === 'sw' ? 'Hotspot Imepatikana • 10Gbps SEACOM Fiber' : 'Hotspot Zone: Nairobi Core • 10Gbps SEACOM Fiber'}</span>
            )}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
          {lang === 'sw' ? (
            <>
              Unganisha. Lipa kwa <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">M-Pesa</span>. Furahia Kasi.
            </>
          ) : (
            <>
              Connect. Pay with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">M-Pesa</span>. Stream Instantly.
            </>
          )}
        </h1>

        <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {lang === 'sw'
            ? 'Pata intaneti yenye kasi ya ajabu bila kikomo. Chagua kifurushi chako, thibitisha kwenye simu yako, na uanze kuvinjari mara moja.'
            : 'Experience next-gen fiber speeds with zero buffering. Select your pass, confirm on your phone via M-Pesa STK push, and browse seamlessly.'}
        </p>

        {/* Active Session Notification Card if online */}
        {activeSession && (
          <div className="mt-8 max-w-xl mx-auto glass-panel-emerald rounded-3xl p-6 border border-emerald-400/50 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-display uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'sw' ? 'Kipindi Kinachofanya Kazi' : 'Active Hotspot Session'}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-[11px] text-red-400 hover:text-red-300 underline font-medium"
              >
                {lang === 'sw' ? 'Tenganisha' : 'Disconnect'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-left">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'sw' ? 'Kifurushi' : 'Plan Name'}</div>
                <div className="text-sm font-bold text-white font-display">{activeSession.planName}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'sw' ? 'Kasi Iliyotengwa' : 'Allocated Speed'}</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">{activeSession.speedLimit}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-mono">
              <span>Token: {activeSession.token.slice(0, 14)}...</span>
              <span className="text-cyan-300">{lang === 'sw' ? 'Hali: Imeunganishwa' : 'Status: Connected'}</span>
            </div>
          </div>
        )}

        {/* Feature Navigation Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: 'plans', label: lang === 'sw' ? '⚡ Vifurushi vya Intaneti' : '⚡ Internet Packages', icon: Zap },
            { id: 'voucher', label: lang === 'sw' ? '🎫 Tumia Vocha' : '🎫 Redeem Voucher', icon: Ticket },
            { id: 'speed', label: lang === 'sw' ? '🚀 Pima Kasi' : '🚀 Speed Test', icon: Gauge },
            { id: 'faq', label: lang === 'sw' ? '❓ Msaada & Maswali' : '❓ FAQs & Support', icon: HelpCircle },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'speed') {
                    setShowSpeedTest(true);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all duration-300 ${
                  isActive && tab.id !== 'speed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-neon-emerald scale-105'
                    : 'glass-panel text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/40 hover:scale-[1.02]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Tab 1: 3D Internet Plan Cards */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`glass-panel-card rounded-[32px] p-6 sm:p-8 border relative overflow-hidden group hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-emerald-400/80 shadow-2xl shadow-emerald-500/20 bg-emerald-950/20'
                      : 'border-white/10 hover:border-emerald-400/50'
                  }`}
                >
                  {/* Glowing popular ribbon */}
                  {plan.isPopular && (
                    <div className="absolute -top-3 -right-12 rotate-45 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-12 shadow-md">
                      BEST VALUE
                    </div>
                  )}

                  <div>
                    {/* Badge & Duration */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-emerald-400 font-display uppercase tracking-wider">
                        {plan.badge || 'Kijani Fast'}
                      </span>
                      <span className="text-xs bg-white/10 text-slate-200 px-3 py-1 rounded-full font-mono border border-white/10">
                        {formatDuration(plan.duration, lang)}
                      </span>
                    </div>

                    {/* Plan Name & Description */}
                    <h3 className="text-2xl font-bold font-display text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-slate-300 mb-6 leading-relaxed min-h-[36px]">
                      {plan.description || 'Ultra-low latency connection optimized for streaming, social media & video calls.'}
                    </p>

                    {/* Price Tag */}
                    <div className="mb-6 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-extrabold font-display text-emerald-400">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-xs text-slate-400 font-sans ml-2">
                        / {formatDuration(plan.duration, lang)}
                      </span>
                    </div>

                    {/* Feature Spec List */}
                    <div className="space-y-3 py-4 border-t border-b border-white/10 text-xs text-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center">
                          <Zap className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                          {lang === 'sw' ? 'Kasi ya Intaneti' : 'Speed Limit'}
                        </span>
                        <span className="font-bold text-white font-mono">{plan.speedLimit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center">
                          <Download className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                          {lang === 'sw' ? 'Kiwango cha Data' : 'Data Allowance'}
                        </span>
                        <span className="font-bold text-white font-mono">{plan.dataLimit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                          {lang === 'sw' ? 'Muda wa Kutumika' : 'Session Duration'}
                        </span>
                        <span className="font-bold text-white font-mono">{formatDuration(plan.duration, lang)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Select Plan Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-neon-emerald flex items-center justify-center space-x-2 transition-all ${
                        plan.isPopular ? 'btn-kijani text-white' : 'btn-kijani text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{lang === 'sw' ? `Nunua kwa ${formatCurrency(plan.price)}` : `Pay with M-Pesa (${formatCurrency(plan.price)})`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* How It Works 3D Process Steps */}
            <div className="mt-16 glass-panel-card rounded-[36px] p-8 sm:p-12 border border-white/10 shadow-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">
                {lang === 'sw' ? 'Jinsi Inavyofanya Kazi' : 'How KijaniLink Works in 3 Easy Steps'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-10 max-w-xl mx-auto">
                {lang === 'sw'
                  ? 'Mfumo wa kisasa wa kiotomatiki unaokuunganisha ndani ya sekunde 3 baada ya kulipa.'
                  : 'Automated MikroTik hotspot provisioning with instant Safaricom M-Pesa STK push integration.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-emerald-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-neon-emerald mb-4 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '1. Chagua Kifurushi' : '1. Choose Package'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Chagua saa 1, saa 24, wiki au mwezi mzima kulingana na mahitaji yako.' : 'Pick your preferred high-speed hourly, daily, weekly, or unlimited monthly pass.'}
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-emerald-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-neon-cyan mb-4 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '2. Weka PIN ya M-Pesa' : '2. Enter M-Pesa PIN'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Ujumbe wa STK Push utatokea papo hapo kwenye simu yako. Weka PIN yako ya siri.' : 'A prompt pops up automatically on your phone. Enter your 4-digit PIN to authorize payment.'}
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-emerald-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-neon-purple mb-4 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '3. Unganishwa Mara Moja' : '3. Auto-Connect & Stream'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Router inafungua mlango wa intaneti mara moja. Furahia kasi bila kikomo!' : 'Our MikroTik edge router instantly enables your MAC address for ultra-fast browsing.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Voucher Redemption */}
        {activeTab === 'voucher' && (
          <div className="max-w-xl mx-auto">
            <VoucherScratchCard onSuccess={handleVoucherSuccess} />
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto glass-panel-card rounded-[36px] p-8 sm:p-10 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold font-display text-white mb-6 text-center">
              {lang === 'sw' ? 'Maswali Yanayoulizwa Mara kwa Mara' : 'Frequently Asked Questions & Support'}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Nifanye nini iwapo sikupokea ujumbe wa M-Pesa?' : 'What if I did not receive the M-Pesa STK Push prompt?'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'sw'
                    ? 'Hakikisha simu yako iko hewani na ina mtandao. Unaweza pia kutumia nambari ya Paybill 174379 na kuweka akaunti yako.'
                    : 'Ensure your phone is unlocked and has cellular reception. You can also manually pay via Safaricom Paybill 174379.'}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Je, naweza kutumia kifurushi kwenye kifaa kingine?' : 'Can I transfer or share my purchased session?'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'sw'
                    ? 'Kila kifurushi kimefungwa kwa anwani ya MAC ya kifaa chako kwa usalama wako. Unaweza kuomba nambari ya vocha kwa matumizi mbadala.'
                    : 'Sessions are linked to your device hardware MAC for maximum security. You can also generate multi-device vouchers from your portal.'}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Mawasiliano ya Huduma kwa Wateja' : '24/7 Customer Care Helpline'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Phone / WhatsApp: <span className="text-emerald-400 font-mono font-bold">+254 700 000 001</span> • Email: <span className="text-cyan-400 font-mono">support@kijanilink.co.ke</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* M-Pesa STK Push Form Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel-emerald rounded-[36px] p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">M-Pesa Express Checkout</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Selected Plan Summary */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{selectedPlan.name}</span>
                <span className="text-lg font-extrabold text-emerald-400 font-display">
                  {formatCurrency(selectedPlan.price)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Speed: <span className="text-white font-semibold">{selectedPlan.speedLimit}</span> • Validity: <span className="text-white font-semibold">{formatDuration(selectedPlan.duration, lang)}</span>
              </div>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Safaricom M-Pesa Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712 345 678"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You will receive an instant STK PIN prompt on this line
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-kijani w-full py-3.5 rounded-xl font-bold text-white shadow-neon-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span>Initiating STK Push...</span>
                  </>
                ) : (
                  <>
                    <span>Send M-Pesa Prompt ({formatCurrency(selectedPlan.price)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3D Interactive Smartphone Simulator Modal */}
      {selectedPlan && (
        <MpesaPhoneSimulator
          isOpen={showPhoneSimulator}
          phoneNumber={phoneNumber}
          amount={selectedPlan.price}
          planName={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPhoneSimulator(false)}
        />
      )}

      {/* Speed Test Modal */}
      <SpeedTestModal isOpen={showSpeedTest} onClose={() => setShowSpeedTest(false)} />

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 pt-8 max-w-7xl mx-auto px-4 sm:px-8 text-center text-xs text-slate-400 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-neon-emerald" />
            <span className="font-bold text-white font-display">KijaniLink Broadband Ecosystem</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span>Safaricom Daraja API 2.0</span>
            <span>•</span>
            <span>MikroTik RouterOS v7</span>
            <span>•</span>
            <span>SEACOM 10G Ring</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 KijaniLink ISP Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortal;
