import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Clock, 
  Zap, 
  Download, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Gauge, 
  Ticket, 
  RefreshCw, 
  HelpCircle,
  Server,
  MapPin,
  User,
  Timer,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDuration, isValidKenyanPhone } from '../utils/formatters';
import { publicAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { FloatingBackground3D } from '../components/FloatingBackground3D';
import { SpeedTestModal } from '../components/SpeedTestModal';
import { VoucherScratchCard } from '../components/VoucherScratchCard';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import type { Plan } from '../types';

export const CustomerPortal: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'voucher' | 'speed' | 'faq'>('plans');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'sw'>('en');

  // Activation Request Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [connectionType, setConnectionType] = useState<'HOTSPOT' | 'PPPOE'>('HOTSPOT');

  // Active Grace / Approved Session State
  const [activeRequest, setActiveRequest] = useState<{
    requestId: string;
    sessionToken: string;
    status: 'PENDING_APPROVAL' | 'APPROVED';
    planName: string;
    speedLimit: string;
    graceExpiresAt: string;
    fullExpiresAt?: string;
    connectionType: 'HOTSPOT' | 'PPPOE';
    pppoeUsername?: string;
    pppoePassword?: string;
  } | null>(null);

  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number>(600);

  useEffect(() => {
    fetchPlans();
    
    // Load existing active request if saved
    const saved = localStorage.getItem('kijani_activation_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveRequest(parsed);
      } catch {
        // Ignore
      }
    }
  }, []);

  // Poll status from server if request is pending
  useEffect(() => {
    if (!activeRequest || activeRequest.status === 'APPROVED') return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await publicAPI.getActivationStatus(activeRequest.requestId);
        if (res.success && res.data) {
          if (res.data.status === 'APPROVED' && activeRequest.status !== 'APPROVED') {
            const updated = {
              ...activeRequest,
              status: 'APPROVED' as const,
              fullExpiresAt: res.data.fullExpiresAt,
              speedLimit: res.data.speedLimit,
              planName: res.data.planName
            };
            setActiveRequest(updated);
            localStorage.setItem('kijani_activation_session', JSON.stringify(updated));

            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 }
            });

            toast.success(
              lang === 'sw'
                ? '🎉 Ombi lako limeidhinishwa na Admin! Kifurushi kimefunguliwa kikamilifu.'
                : '🎉 Admin Approved! Your full package duration is now 100% active!'
            );
          }
        }
      } catch {
        // Ignore poll error
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeRequest, lang]);

  // Grace countdown clock
  useEffect(() => {
    if (!activeRequest || activeRequest.status === 'APPROVED') return;

    const timer = setInterval(() => {
      const remainingMs = new Date(activeRequest.graceExpiresAt).getTime() - Date.now();
      const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
      setGraceSecondsLeft(remainingSecs);

      if (remainingSecs <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRequest]);

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
    setShowActivationModal(true);
  };

  const handleRequestActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!isValidKenyanPhone(phoneNumber)) {
      toast.error(lang === 'sw' ? 'Tafadhali weka nambari sahihi ya simu' : 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await publicAPI.requestActivation({
        fullName: fullName || 'Hotspot Subscriber',
        phone: phoneNumber,
        location: location || 'Hotspot Zone',
        connectionType,
        planId: selectedPlan.id
      });

      if (res.success && res.data) {
        setShowActivationModal(false);
        const sessionObj = {
          requestId: res.data.requestId,
          sessionToken: res.data.sessionToken,
          status: 'PENDING_APPROVAL' as const,
          planName: selectedPlan.name,
          speedLimit: selectedPlan.speedLimit,
          graceExpiresAt: res.data.graceExpiresAt,
          connectionType,
          pppoeUsername: res.data.pppoeUsername,
          pppoePassword: res.data.pppoePassword
        };
        setActiveRequest(sessionObj);
        localStorage.setItem('kijani_activation_session', JSON.stringify(sessionObj));

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(
          lang === 'sw'
            ? '⚡ Umepewa intaneti ya muda (Dakika 10) wakati Admin anaidhinisha ombi lako!'
            : '⚡ 10-Minute Grace Access Activated! You are online while Admin approves your request.'
        );
      }
    } catch {
      toast.error('Failed to submit connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherSuccess = (sessionToken: string, planName: string) => {
    const sessionObj = {
      requestId: 'vch-' + Date.now(),
      sessionToken,
      status: 'APPROVED' as const,
      planName,
      speedLimit: '50 Mbps',
      graceExpiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
      fullExpiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
      connectionType: 'HOTSPOT' as const
    };
    setActiveRequest(sessionObj);
    localStorage.setItem('kijani_activation_session', JSON.stringify(sessionObj));
    setActiveTab('plans');
  };

  const handleDisconnect = () => {
    setActiveRequest(null);
    localStorage.removeItem('kijani_activation_session');
    toast.success('Disconnected from session');
  };

  // Format grace timer to MM:SS
  const formatGraceTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-8 text-center relative z-10">
        
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass-panel-emerald text-xs font-semibold mb-6 border border-emerald-400/40 shadow-neon-emerald animate-float-slow">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300">
            {activeRequest ? (
              activeRequest.status === 'APPROVED' ? (
                <span>{lang === 'sw' ? '✅ Kifurushi Kimeidhinishwa na Kinafanya Kazi' : '✅ Full Package Approved & Active'}</span>
              ) : (
                <span>{lang === 'sw' ? '⚡ Intaneti ya Muda (Grace Period) Inaendelea' : '⚡ 10-Min Grace Access Active • Awaiting Admin Approval'}</span>
              )
            ) : (
              <span>{lang === 'sw' ? 'Unganisha Mara Moja • MikroTik Hotspot & PPPoE' : 'Instant Connection • Hotspot & PPPoE Fiber Ready'}</span>
            )}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-tight">
          {lang === 'sw' ? (
            <>
              Chagua Kifurushi. <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Unganishwa Mara Moja</span>.
            </>
          ) : (
            <>
              Choose Your Package. <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Connect Instantly</span>.
            </>
          )}
        </h1>

        <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {lang === 'sw'
            ? 'Chagua kifurushi chako uweze kuunganishwa mara moja kwa dakika 10 za kwanza huku ombi lako likiidhinishwa na Admin kwa kifurushi kamili.'
            : 'Select your preferred pass and enjoy instant 10-minute grace internet access while your full package request is processed and activated by Admin.'}
        </p>

        {/* Active Grace / Approved Status Banner */}
        {activeRequest && (
          <div className={`mt-8 max-w-xl mx-auto rounded-3xl p-6 border shadow-2xl animate-fadeIn ${
            activeRequest.status === 'APPROVED'
              ? 'glass-panel-emerald border-emerald-400/60 bg-emerald-950/20 shadow-neon-emerald'
              : 'glass-panel border-amber-500/50 bg-amber-950/20'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2 text-xs font-bold font-display uppercase tracking-wider">
                {activeRequest.status === 'APPROVED' ? (
                  <span className="text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    {lang === 'sw' ? 'Kifurushi Kimeidhinishwa' : 'Full Package Activated'}
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center">
                    <Timer className="w-4 h-4 mr-1.5 animate-spin" />
                    {lang === 'sw' ? 'Dakika 10 za Muda (Grace Period)' : '10-Min Temporary Grace Access'}
                  </span>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="text-[11px] text-red-400 hover:text-red-300 underline font-medium"
              >
                {lang === 'sw' ? 'Tenganisha' : 'Disconnect'}
              </button>
            </div>

            {/* Grace Countdown Meter */}
            {activeRequest.status === 'PENDING_APPROVAL' && (
              <div className="my-4 p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-300 uppercase font-semibold">Temporary Grace Clock</div>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">
                    {formatGraceTimer(graceSecondsLeft)}
                  </div>
                  <div className="text-[10px] text-slate-400">Awaiting Admin Approval...</div>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <div className="font-bold text-white">{activeRequest.planName}</div>
                  <div className="text-emerald-400 font-mono">{activeRequest.speedLimit}</div>
                </div>
              </div>
            )}

            {/* Approved View */}
            {activeRequest.status === 'APPROVED' && (
              <div className="my-4 grid grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Active Package</div>
                  <div className="text-base font-bold text-white font-display">{activeRequest.planName}</div>
                  <div className="text-xs text-emerald-400 font-mono font-semibold">{activeRequest.speedLimit}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Access Duration</div>
                  <div className="text-xs text-slate-300 font-mono mt-1">
                    Expires: {new Date(activeRequest.fullExpiresAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* PPPoE Credentials if applicable */}
            {activeRequest.connectionType === 'PPPOE' && activeRequest.pppoeUsername && (
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-left text-xs mb-2">
                <div className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Your PPPoE Dial-in Credentials:</div>
                <div className="font-mono text-slate-200">
                  User: <strong className="text-white">{activeRequest.pppoeUsername}</strong> | Pass: <strong className="text-white">{activeRequest.pppoePassword}</strong>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Mode: {activeRequest.connectionType}</span>
              <span className="text-emerald-400">High-Speed Online</span>
            </div>
          </div>
        )}

        {/* Feature Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
        
        {/* Tab 1: Internet Packages */}
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
                  {plan.isPopular && (
                    <div className="absolute -top-3 -right-12 rotate-45 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-12 shadow-md">
                      BEST VALUE
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-emerald-400 font-display uppercase tracking-wider">
                        {plan.badge || 'Kijani Fast'}
                      </span>
                      <span className="text-xs bg-white/10 text-slate-200 px-3 py-1 rounded-full font-mono border border-white/10">
                        {formatDuration(plan.duration, lang)}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold font-display text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-slate-300 mb-6 leading-relaxed min-h-[36px]">
                      {plan.description || 'Ultra-low latency connection optimized for streaming, social media & video calls.'}
                    </p>

                    <div className="mb-6 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-extrabold font-display text-emerald-400">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-xs text-slate-400 font-sans ml-2">
                        / {formatDuration(plan.duration, lang)}
                      </span>
                    </div>

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

                  <div className="mt-6">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className="btn-kijani w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-neon-emerald flex items-center justify-center space-x-2 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{lang === 'sw' ? `Unganisha Sasa (Grace ya Dakika 10)` : `Connect with 10-Min Grace Pass`}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* How Connection Workflow Works */}
            <div className="mt-16 glass-panel-card rounded-[36px] p-8 sm:p-12 border border-white/10 shadow-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">
                {lang === 'sw' ? 'Jinsi Ya Kujiunga na KijaniLink' : 'How KijaniLink Activation Works'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-10 max-w-xl mx-auto">
                {lang === 'sw'
                  ? 'Pata ufikiaji wa papo hapo wa dakika 10 huku msimamizi (Admin) akithibitisha kifurushi chako kamili.'
                  : 'Get instant 10-minute temporary browsing access while our Administrator activates your full duration.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-emerald-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-neon-emerald mb-4 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '1. Chagua Kifurushi & Weka Maelezo' : '1. Choose Plan & Submit'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Chagua Hotspot au PPPoE na uweke nambari yako ya simu na jina.' : 'Select Hotspot or PPPoE connection and enter your phone number and location.'}
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-amber-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md mb-4 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '2. Dakika 10 za Bure (Grace Pass)' : '2. Instant 10-Min Grace Pass'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Unapata intaneti ya kasi ya juu papo hapo kwa dakika 10 bila kusubiri.' : 'Browse immediately with zero delay while your request is sent to the Admin portal.'}
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 relative group hover:border-emerald-400/40 transition-all">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-neon-cyan mb-4 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {lang === 'sw' ? '3. Admin Anaidhinisha Kifurushi' : '3. Full Package Approved'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'sw' ? 'Msimamizi anaidhinisha ombi lako na muda wako kamili unaanza kutumika.' : 'Admin approves your request and your full duration & maximum speed tier unlocks!'}
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
              {lang === 'sw' ? 'Msaada & Maswali Yanayoulizwa Mara kwa Mara' : 'Frequently Asked Questions & Support'}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Grace Period ya Dakika 10 ni nini?' : 'What is the 10-Minute Grace Period?'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'sw'
                    ? 'Ni muda wa majaribio wa bure wa dakika 10 unaopewa mara tu unapochagua kifurushi, ili uanze kuvinjari mara moja wakati msimamizi anaidhinisha ombi lako.'
                    : 'It is a 10-minute instant temporary access granted immediately upon requesting a package so you have connectivity while the Admin approves and activates your full duration.'}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Tofauti kati ya Hotspot na PPPoE ni ipi?' : 'What is the difference between Hotspot and PPPoE?'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'sw'
                    ? 'Hotspot inatumia WiFi ya simu au kompyuta moja kwa moja. PPPoE inatumika kuweka akaunti kwenye router ya nyumbani au ofisini.'
                    : 'Hotspot binds directly to your mobile/laptop WiFi MAC address. PPPoE generates credentials for home/office fiber routers.'}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white text-sm mb-1">
                  {lang === 'sw' ? 'Mawasiliano ya Msimamizi' : 'Admin & Support Contact'}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Phone / WhatsApp: <span className="text-emerald-400 font-mono font-bold">+254 700 000 001</span> • Email: <span className="text-cyan-400 font-mono">support@kijanilink.co.ke</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Connection & Admin Activation Request Modal */}
      {showActivationModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel-emerald rounded-[36px] p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">Connect & Request Activation</h3>
              </div>
              <button
                onClick={() => setShowActivationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Selected Plan Summary */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{selectedPlan.name}</span>
                <span className="text-lg font-extrabold text-emerald-400 font-display">
                  {formatCurrency(selectedPlan.price)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Speed: <strong className="text-white">{selectedPlan.speedLimit}</strong></span>
                <span>Duration: <strong className="text-white">{formatDuration(selectedPlan.duration, lang)}</strong></span>
              </div>
            </div>

            <form onSubmit={handleRequestActivation} className="space-y-3.5 text-xs">
              
              {/* Connection Mode Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Connection Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectionType('HOTSPOT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      connectionType === 'HOTSPOT'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-neon-emerald'
                        : 'glass-panel border-white/10 text-slate-400'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>WiFi Hotspot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConnectionType('PPPOE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      connectionType === 'PPPOE'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan'
                        : 'glass-panel border-white/10 text-slate-400'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>PPPoE Router</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Mwangi"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712 345 678"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">House / Room / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Block B, Room 204"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>You will get instant 10-min grace browsing access upon submitting!</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-kijani w-full py-3.5 rounded-xl font-bold text-white shadow-neon-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-xs sm:text-sm mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span>Connecting & Requesting Access...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Now (Start 10-Min Grace)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
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
            <span>Admin-Activated Access</span>
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
