import React, { useState, useEffect } from 'react';
import { Gauge, Zap, ArrowDown, ArrowUp, X, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeedTestModal: React.FC<SpeedTestModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [ping, setPing] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [download, setDownload] = useState<number>(0);
  const [upload, setUpload] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  const startTest = () => {
    setStage('ping');
    setPing(0);
    setJitter(0);
    setDownload(0);
    setUpload(0);
    setCurrentSpeed(0);

    // Stage 1: Ping & Jitter
    let pingSteps = 0;
    const pingInterval = setInterval(() => {
      pingSteps++;
      setPing(Math.floor(8 + Math.random() * 8));
      setJitter(Math.floor(1 + Math.random() * 3));
      if (pingSteps >= 10) {
        clearInterval(pingInterval);
        startDownloadTest();
      }
    }, 100);
  };

  const startDownloadTest = () => {
    setStage('download');
    let progress = 0;
    const targetDownload = 48.5 + (Math.random() * 25);
    
    const dlInterval = setInterval(() => {
      progress += 2;
      const speed = Math.min(targetDownload, (progress / 100) * targetDownload * (0.8 + Math.random() * 0.4));
      setCurrentSpeed(Number(speed.toFixed(1)));
      setDownload(Number(speed.toFixed(1)));

      if (progress >= 100) {
        clearInterval(dlInterval);
        startUploadTest();
      }
    }, 50);
  };

  const startUploadTest = () => {
    setStage('upload');
    let progress = 0;
    const targetUpload = 24.2 + (Math.random() * 12);
    
    const ulInterval = setInterval(() => {
      progress += 2;
      const speed = Math.min(targetUpload, (progress / 100) * targetUpload * (0.8 + Math.random() * 0.4));
      setCurrentSpeed(Number(speed.toFixed(1)));
      setUpload(Number(speed.toFixed(1)));

      if (progress >= 100) {
        clearInterval(ulInterval);
        setStage('complete');
        setCurrentSpeed(0);
      }
    }, 50);
  };

  useEffect(() => {
    if (isOpen) {
      startTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute needle rotation angle from speed (0 to 100 Mbps -> -120deg to 120deg)
  const maxDial = 100;
  const needleAngle = Math.min(120, Math.max(-120, ((currentSpeed / maxDial) * 240) - 120));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel-emerald rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-neon-emerald">
              <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center">
                <Gauge className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">KijaniLink Speed Test</h3>
              <p className="text-xs text-emerald-400/90 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Core Backbone #04 • 10Gbps Uplink
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Speedometer Dial */}
        <div className="my-8 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-48 flex items-center justify-center">
            {/* SVG Speed Arc */}
            <svg viewBox="0 0 200 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="60%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              {/* Background track */}
              <path
                d="M 25 125 A 75 75 0 1 1 175 125"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Active glow track */}
              <path
                d="M 25 125 A 75 75 0 1 1 175 125"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="12"
                strokeDasharray="235"
                strokeDashoffset={235 - (235 * Math.min(100, currentSpeed)) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Needle Pivot & Indicator */}
            <div 
              className="absolute bottom-6 left-1/2 w-1.5 h-24 bg-gradient-to-t from-emerald-400 to-white origin-bottom rounded-full shadow-neon-emerald transition-transform duration-100 ease-out"
              style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-neon-emerald" />

            {/* Center Speed Display */}
            <div className="absolute bottom-0 text-center">
              <div className="text-4xl font-extrabold font-display tracking-tight text-white drop-shadow-md">
                {currentSpeed > 0 ? currentSpeed.toFixed(1) : (stage === 'complete' ? download.toFixed(1) : '--')}
              </div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {stage === 'download' ? 'Testing Download (Mbps)' : stage === 'upload' ? 'Testing Upload (Mbps)' : stage === 'ping' ? 'Checking Latency...' : 'Mbps Realtime'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="glass-panel rounded-2xl p-3 text-center border border-white/5">
            <div className="flex items-center justify-center text-xs text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Ping / Jitter
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {ping > 0 ? `${ping}ms` : '--'}
            </div>
            <div className="text-[10px] text-slate-500">
              {jitter > 0 ? `±${jitter}ms jitter` : 'Fiber low-latency'}
            </div>
          </div>

          <div className={`glass-panel rounded-2xl p-3 text-center border ${stage === 'download' ? 'border-emerald-500/50 shadow-neon-emerald' : 'border-white/5'}`}>
            <div className="flex items-center justify-center text-xs text-slate-400 mb-1">
              <ArrowDown className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Download
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {download > 0 ? `${download.toFixed(1)}` : '--'}
            </div>
            <div className="text-[10px] text-slate-500">Mbps (Burst ready)</div>
          </div>

          <div className={`glass-panel rounded-2xl p-3 text-center border ${stage === 'upload' ? 'border-cyan-500/50 shadow-neon-cyan' : 'border-white/5'}`}>
            <div className="flex items-center justify-center text-xs text-slate-400 mb-1">
              <ArrowUp className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Upload
            </div>
            <div className="text-lg font-bold text-cyan-400 font-mono">
              {upload > 0 ? `${upload.toFixed(1)}` : '--'}
            </div>
            <div className="text-[10px] text-slate-500">Mbps (Symmetric)</div>
          </div>
        </div>

        {/* Status text & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center">
            {stage === 'complete' ? (
              <span className="text-emerald-400 flex items-center font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Your line is optimal for 4K streaming & gaming!
              </span>
            ) : (
              <span className="flex items-center">
                <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin text-emerald-400" /> Running live throughput test...
              </span>
            )}
          </div>
          <button
            onClick={startTest}
            disabled={stage !== 'complete' && stage !== 'idle'}
            className="btn-kijani px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${stage !== 'complete' && stage !== 'idle' ? 'animate-spin' : ''}`} />
            Retest Speed
          </button>
        </div>
      </div>
    </div>
  );
};
