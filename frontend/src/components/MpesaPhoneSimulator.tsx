import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, X, Shield, Wifi, Lock, Sparkles, Send } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface MpesaPhoneSimulatorProps {
  isOpen: boolean;
  phoneNumber: string;
  amount: number;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MpesaPhoneSimulator: React.FC<MpesaPhoneSimulatorProps> = ({
  isOpen,
  phoneNumber,
  amount,
  planName,
  onSuccess,
  onCancel
}) => {
  const [pin, setPin] = useState<string>('');
  const [status, setStatus] = useState<'prompt' | 'processing' | 'success' | 'failed'>('prompt');
  const [countdown, setCountdown] = useState<number>(30);
  const [currentTime, setCurrentTime] = useState<string>('12:45');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setStatus('prompt');
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleConfirmPin = () => {
    if (pin.length !== 4) return;
    setStatus('processing');

    setTimeout(() => {
      setStatus('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1200);
  };

  const handleInstantPay = () => {
    setPin('9821');
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onSuccess();
      }, 1800);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel rounded-[40px] p-4 border border-emerald-500/40 shadow-2xl overflow-hidden perspective-1000">
        
        {/* Glow behind phone */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Outer Phone Shell */}
        <div className="relative w-full bg-slate-900/90 rounded-[34px] border-4 border-slate-700/60 p-4 text-white shadow-inner flex flex-col justify-between min-h-[580px]">
          
          {/* Phone Top Speaker & Notch */}
          <div>
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-xs font-semibold text-slate-300 font-mono">{currentTime}</span>
              <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center space-x-1 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">5G</span>
                <div className="w-4 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-emerald-400 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Safaricom Header Banner */}
            <div className="mt-2 py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-ping" />
                SAFARICOM M-PESA
              </span>
              <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded">STK Push</span>
            </div>
          </div>

          {/* Main Interactive Screen Content */}
          <div className="my-auto py-2">
            {status === 'prompt' && (
              <div className="glass-panel-card rounded-2xl p-4 border border-emerald-500/30 shadow-lg text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-neon-emerald">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>

                <h4 className="text-sm font-bold text-white mb-1">Do you want to pay?</h4>
                <p className="text-xs text-slate-300 mb-2">
                  <span className="font-semibold text-emerald-400">{formatCurrency(amount)}</span> to <span className="font-semibold text-white">KijaniLink ISP</span> for <span className="text-emerald-300 font-medium">{planName}</span>
                </p>

                <div className="text-[11px] text-slate-400 mb-3 bg-slate-950/60 rounded-lg p-1.5 font-mono">
                  Account: KIJANI-{phoneNumber.slice(-4)}
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center items-center space-x-3 mb-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                        pin.length > index
                          ? 'bg-emerald-400 scale-110 shadow-neon-emerald'
                          : 'border-2 border-slate-500 bg-transparent'
                      }`}
                    />
                  ))}
                </div>

                {/* Simulated Keypad */}
                <div className="grid grid-cols-3 gap-2 px-2 max-w-[220px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleKeyPress(digit)}
                      className="h-10 rounded-xl bg-slate-800/80 hover:bg-emerald-600/60 text-sm font-semibold border border-white/5 active:scale-95 transition-all text-white"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={handleBackspace}
                    className="h-10 rounded-xl bg-slate-800/80 hover:bg-red-500/40 text-xs text-red-300 border border-white/5 active:scale-95 transition-all flex items-center justify-center"
                  >
                    ⌫
                  </button>
                  <button
                    onClick={() => handleKeyPress('0')}
                    className="h-10 rounded-xl bg-slate-800/80 hover:bg-emerald-600/60 text-sm font-semibold border border-white/5 active:scale-95 transition-all text-white"
                  >
                    0
                  </button>
                  <button
                    onClick={handleConfirmPin}
                    disabled={pin.length !== 4}
                    className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-xs font-bold border border-emerald-400/40 active:scale-95 transition-all text-white flex items-center justify-center"
                  >
                    OK
                  </button>
                </div>

                {/* Instant Pay Helper */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={handleInstantPay}
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 hover:from-emerald-500/50 hover:to-cyan-500/50 border border-emerald-400/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center justify-center transition-all shadow-sm group"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-400 group-hover:rotate-12 transition-transform" />
                    Simulate Instant PIN Entry
                  </button>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center" />
                <h4 className="text-base font-bold text-white">Authorizing Payment...</h4>
                <p className="text-xs text-slate-400">Communicating with Safaricom Daraja Gateway...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-neon-emerald">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Payment Confirmed!</h4>
                <p className="text-xs text-emerald-300 font-mono">
                  Receipt: KJL{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </p>
                <div className="text-xs text-slate-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5">
                  ✨ High-speed session activated! Connecting device now...
                </div>
              </div>
            )}
          </div>

          {/* Phone Bottom Navigation Bar & Close */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[10px]">Timer: {countdown}s</span>
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
