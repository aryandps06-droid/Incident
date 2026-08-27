import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Radio, 
  KeyRound,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth, type UserProfile } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    signInWithGoogle, 
    sendEmailOtp, 
    verifyOtpAndCreateAccount, 
    signInWithEmail 
  } = useAuth();

  const [tab, setTab] = useState<'google' | 'otp' | 'password'>('google');
  
  // Google Form State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // OTP Form State
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpRole, setOtpRole] = useState<UserProfile['role']>('Incident Lead');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpPassword, setOtpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // Password Sign-in State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 1. Google Direct Sign-In
  const handleGoogleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const email = googleEmail.trim() || 'aryan.sharma.dev@gmail.com';
      const name = googleName.trim() || 'Aryan Sharma';
      const profile = await signInWithGoogle(email, name);
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request OTP Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await sendEmailOtp(otpEmail);
      setSimulatedCode(res.simulatedOtp);
      setSuccessMsg(`6-Digit Verification Code sent to ${otpEmail}`);
      setOtpStep('verify');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP digit backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Auto-generate strong password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOtpPassword(pwd);
  };

  // Verify OTP & Create Password Account
  const handleVerifyOtpAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (!otpPassword || otpPassword.length < 6) {
      setError('Please enter a master password (minimum 6 characters).');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const profile = await verifyOtpAndCreateAccount(
        otpEmail,
        code,
        otpPassword,
        otpName || otpEmail.split('@')[0],
        otpRole
      );
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Existing Password Login
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const profile = await signInWithEmail(loginEmail, loginPassword);
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020305]/85 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md rounded-2xl bg-[#060913] border border-cyan-500/30 p-6 shadow-[0_25px_80px_rgba(0,217,255,0.25)] overflow-hidden"
        >
          
          {/* Top Radial Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition cursor-pointer border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.4)]">
              <Radio className="w-5 h-5 animate-pulse text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">Incident Room Access</span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  PERSISTENT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in with Google, Email OTP, or password.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] mb-5 text-xs font-mono">
            <button
              onClick={() => { setTab('google'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg font-bold transition cursor-pointer text-center ${
                tab === 'google' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              GOOGLE
            </button>
            <button
              onClick={() => { setTab('otp'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg font-bold transition cursor-pointer text-center ${
                tab === 'otp' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EMAIL OTP
            </button>
            <button
              onClick={() => { setTab('password'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg font-bold transition cursor-pointer text-center ${
                tab === 'password' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              PASSWORD
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: GOOGLE 1-CLICK & GOOGLE ACCOUNT SIGN IN
          ══════════════════════════════════════════════════════════════════════ */}
          {tab === 'google' && (
            <div className="flex flex-col gap-3.5">
              
              {/* Primary 1-Click Google Sign-In Button */}
              <button
                type="button"
                onClick={() => handleGoogleSubmit()}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 transition cursor-pointer border-0"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting…' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-3 my-0.5">
                <div className="flex-1 h-[1px] bg-white/[0.08]" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Or Specify Profile</span>
                <div className="flex-1 h-[1px] bg-white/[0.08]" />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Google Mail ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g. aryan.sharma.dev@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Session is securely saved permanently — you won't need to sign in every time.</span>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSubmit()}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer border-0 mt-0.5"
              >
                <span>Enter Incident Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 2: EMAIL OTP VERIFICATION & GENERATE PASSWORD
          ══════════════════════════════════════════════════════════════════════ */}
          {tab === 'otp' && (
            <div>
              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Your Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="e.g. aryan@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={otpName}
                        onChange={(e) => setOtpName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Incident Role
                    </label>
                    <select
                      value={otpRole}
                      onChange={(e) => setOtpRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#03050C] border border-white/[0.08] text-white text-xs outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value="Incident Lead">Incident Lead (Commander)</option>
                      <option value="SRE">Site Reliability Engineer (SRE)</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Support">Support Engineer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Observer">Observer</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer border-0 mt-1"
                  >
                    <span>{isLoading ? 'Generating OTP…' : 'Send 6-Digit Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndCreate} className="flex flex-col gap-3.5">
                  
                  {/* Sent Alert with Simulated Code Banner */}
                  {simulatedCode && (
                    <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-400/50 text-cyan-200 text-xs font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Verification Code: <strong className="text-white text-sm font-bold tracking-widest">{simulatedCode}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = simulatedCode.split('');
                          setOtpDigits(digits);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-[10px] text-cyan-200 cursor-pointer border border-cyan-400/40"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  {/* 6-Digit OTP Box Grid */}
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-mono font-bold rounded-xl bg-white/[0.04] border border-white/[0.12] focus:border-cyan-400 text-white outline-none focus:bg-cyan-950/20"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Password Creation with Auto-Generate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300">
                        Create Master Password
                      </label>
                      <button
                        type="button"
                        onClick={generateStrongPassword}
                        className="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3 text-cyan-400" />
                        <span>Generate Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={otpPassword}
                        onChange={(e) => setOtpPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="hover:text-cyan-300 transition cursor-pointer"
                    >
                      &larr; Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer border-0 mt-1"
                  >
                    <span>{isLoading ? 'Verifying…' : 'Verify & Enter Incident Room'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: SIGN IN WITH EXISTING PASSWORD
          ══════════════════════════════════════════════════════════════════════ */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="officer@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400 text-white placeholder-slate-500 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end text-[10px] font-mono text-cyan-300">
                <button
                  type="button"
                  onClick={() => { setTab('otp'); setOtpStep('request'); }}
                  className="hover:underline cursor-pointer"
                >
                  Forgot Password? Verify via OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer border-0 mt-1"
              >
                <span>{isLoading ? 'Signing In…' : 'Sign In & Enter War Room'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
