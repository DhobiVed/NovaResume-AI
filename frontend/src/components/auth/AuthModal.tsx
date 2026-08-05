import React, { useState, useEffect } from 'react';
import {
  X, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowLeft, Sparkles, ShieldCheck, Briefcase, Globe, Calendar, Zap
} from 'lucide-react';
import { firebaseAuthService } from '../../services/firebaseAuth';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  // Animation States for Full-Screen Floating Experience
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

  // Smooth Mount / Unmount Animation Controller
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setMode(initialMode);
      setErrors({});
      setSuccessMsg(null);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Graceful Smooth Closing Animation Trigger
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 320);
  };

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Smooth Morph Transition between Auth Modes
  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot' | 'reset') => {
    setIsSwitchingMode(true);
    setErrors({});
    setSuccessMsg(null);
    setTimeout(() => {
      setMode(newMode);
      setIsSwitchingMode(false);
    }, 200);
  };

  if (!isRendered) return null;

  // Password Strength Calculator (0-4)
  const calcStrength = (pass: string) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };
  const strength = calcStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const shake = (field: string) => {
    setShakingField(field);
    setTimeout(() => setShakingField(null), 500);
  };

  const setFieldError = (field: string, msg: string) => {
    setErrors({ [field]: msg });
    shake(field);
  };

  // ── AUTHENTICATION HANDLERS ─────────────────────────────────────────

  const handleSignup = async () => {
    if (!fullName.trim()) return setFieldError('fullName', 'Full name is required');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Valid email address is required');
    if (!password) return setFieldError('password', 'Password is required');
    if (password.length < 6) return setFieldError('password', 'Password must be at least 6 characters');
    if (password !== confirmPassword) return setFieldError('confirmPassword', 'Passwords do not match');

    setIsLoading(true);
    setErrors({});
    try {
      await firebaseAuthService.register(fullName.trim(), email.toLowerCase().trim(), password);

      const registeredEmail = email.toLowerCase().trim();
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setSuccessMsg(`✅ Account created in Firebase! Sign in with ${registeredEmail} to continue.`);
      setEmail(registeredEmail);
      handleSwitchMode('login');
    } catch (err: any) {
      let msg = 'Registration failed. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters.';
      }
      setFieldError('email', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Valid email address is required');
    if (!password) return setFieldError('password', 'Password is required');

    setIsLoading(true);
    setErrors({});
    try {
      const userProfile = await firebaseAuthService.login(email.toLowerCase().trim(), password);
      onLoginSuccess(userProfile);
      handleClose();
    } catch (err: any) {
      let msg = 'Invalid email address or password.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later or reset password.';
      }
      setFieldError('email', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Please enter your registered email address');

    setIsLoading(true);
    setErrors({});
    try {
      await firebaseAuthService.sendPasswordReset(email.toLowerCase().trim());
      setSuccessMsg(`✅ Password reset email sent to ${email.toLowerCase().trim()}! Check your inbox.`);
    } catch (err: any) {
      let msg = 'Failed to send password reset email.';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      }
      setFieldError('email', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) return setFieldError('resetToken', 'Reset token is required');
    if (!newPassword || newPassword.length < 6) return setFieldError('newPassword', 'Minimum 6 characters required');
    if (newPassword !== confirmNewPassword) return setFieldError('confirmNewPassword', 'Passwords do not match');

    setSuccessMsg('A password reset link was sent to your email. Please check your inbox and click the link to reset your password.');
    setTimeout(() => handleSwitchMode('login'), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') handleSignup();
    else if (mode === 'login') handleLogin();
    else if (mode === 'forgot') handleForgotPassword();
    else if (mode === 'reset') handleResetPassword();
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 transform-gpu">
      
      {/* 1. Full-Screen Translucent Glassmorphic Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-400 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* 2. Split-Screen Floating Auth Modal Card (Matching demoo.mp4) */}
      <div
        className={`bg-white rounded-[32px] border border-slate-200/90 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4),0_0_50px_rgba(9,95,108,0.2)] w-full max-w-5xl relative flex flex-col md:flex-row overflow-hidden transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 max-h-[95vh] ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 p-2 bg-slate-100/90 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-all duration-200 active:scale-90 z-30 shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── LEFT PANEL: RICH TEAL SHOWCASE WITH ANIMATED FLOATING BADGES ── */}
        <div className="hidden md:flex w-1/2 bg-[#095f6c] bg-gradient-to-br from-[#085460] via-[#0b6c7a] to-[#063e47] p-8 lg:p-10 flex-col justify-between text-white relative overflow-hidden select-none flex-shrink-0">
          
          {/* Subtle Background Glow Circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

          {/* Morphing Left Panel Header Text */}
          <div className={`transition-all duration-300 transform-gpu z-10 ${isSwitchingMode ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-md">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            
            {mode === 'signup' ? (
              <>
                <h2 className="text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight mb-3">
                  Unlock The Full Power<br />of NovaResume AI
                </h2>
                <p className="text-xs lg:text-sm text-teal-100/80 leading-relaxed max-w-sm">
                  Just a few simple steps and you'll be ready to automate, optimize, and craft ATS-proof resumes like never before.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight mb-3">
                  Start Creating Impact<br />Right Away
                </h2>
                <p className="text-xs lg:text-sm text-teal-100/80 leading-relaxed max-w-sm">
                  From AI resume tailoring to job application tracking, let's turn your career goals into measurable results.
                </p>
              </>
            )}
          </div>

          {/* Center Showcase Card with Animated Floating Integration Badges */}
          <div className="relative my-8 py-6 flex items-center justify-center z-10">
            
            {/* Main Central Metrics Preview Card */}
            <div className="w-full max-w-xs bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/60 text-slate-900 transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white text-[10px] font-black">
                    N
                  </div>
                  <span className="text-xs font-black text-slate-900">Campaign Performance</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                  ATS 98%
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block">Open Rate</span>
                  <span className="text-sm font-black text-slate-900">89%</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block">Click Through</span>
                  <span className="text-sm font-black text-emerald-600">68%</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                  <span>Resume Score</span>
                  <span className="text-teal-600">98 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full w-[98%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Pill Badges around Central Card */}
            <div className="absolute -top-1 -left-2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-float-badge-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Calendar</span>
            </div>

            <div className="absolute -top-3 -right-2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-float-badge-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Slack</span>
            </div>

            <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-float-badge-2">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shopify</span>
            </div>

            <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-float-badge-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Google Ads</span>
            </div>

            <div className="absolute -bottom-2 -left-2 bg-white text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5 animate-float-badge-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Zendesk</span>
            </div>

            <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-float-badge-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Retain Feed</span>
            </div>
          </div>

          {/* Left Panel Footer Copyright */}
          <div className="text-[10px] text-teal-200/60 font-semibold tracking-wider uppercase z-10">
            © Vertex / NovaResume 2026. All Rights Reserved
          </div>
        </div>

        {/* ── RIGHT PANEL: CLEAN GLASSMORPHIC AUTH FORM ── */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-white bg-dot-pattern relative overflow-y-auto">
          
          {/* Morphing Form Container */}
          <div className={`transition-all duration-300 transform-gpu ${isSwitchingMode ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-1 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-600/30 mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'signup' ? 'Create Vertex Account' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                {mode === 'signup'
                  ? 'Drive growth with intelligent automation and effortless teamwork'
                  : mode === 'login'
                  ? 'Sign in to access your resumes, portfolios & AI mentor'
                  : 'Enter your registered email address to receive reset link'}
              </p>
            </div>

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3.5 mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Pure Clean Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Full Name — Signup Only */}
              {mode === 'signup' && (
                <div className={`space-y-1 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-bold text-slate-700 block">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                  {errors.fullName && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</span>}
                </div>
              )}

              {/* Email Address — Login, Signup, Forgot */}
              {mode !== 'reset' && (
                <div className={`space-y-1 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-bold text-slate-700 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                  {errors.email && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</span>}
                </div>
              )}

              {/* Reset Token — Reset Mode */}
              {mode === 'reset' && (
                <div className={`space-y-1 ${shakingField === 'resetToken' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-bold text-slate-700 block">Reset Token</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-mono focus:outline-none transition-all duration-200 ${
                      errors.resetToken ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                  {errors.resetToken && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.resetToken}</span>}
                </div>
              )}

              {/* Password — Login, Signup */}
              {(mode === 'login' || mode === 'signup') && (
                <div className={`space-y-1 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create your password"
                      className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</span>}

                  {/* Password Strength Meter */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500">Strength</span>
                        <span className="text-slate-700">{strengthLabels[Math.min(3, strength)]}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                        {[0, 1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${step <= strength ? strengthColors[Math.min(3, strength)] : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password — Signup */}
              {mode === 'signup' && (
                <div className={`space-y-1 ${shakingField === 'confirmPassword' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        errors.confirmPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</span>}
                </div>
              )}

              {/* New Password & Confirm — Reset Mode */}
              {mode === 'reset' && (
                <>
                  <div className={`space-y-1 ${shakingField === 'newPassword' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-bold text-slate-700 block">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                          errors.newPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                        }`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.newPassword}</span>}
                  </div>

                  <div className={`space-y-1 ${shakingField === 'confirmNewPassword' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                          errors.confirmNewPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmNewPassword}</span>}
                  </div>
                </>
              )}

              {/* Submit Button (Matching demoo.mp4 dark button style) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#182230] hover:bg-[#0f1728] active:bg-black text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50 mt-5 transform-gpu"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{mode === 'signup' ? 'Sign Up' : mode === 'login' ? 'Sign In' : 'Send Link'}</span>
                )}
              </button>
            </form>

            {/* Footer Mode Morph Switch (Matching demoo.mp4) */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
              {(mode === 'forgot' || mode === 'reset') ? (
                <button
                  onClick={() => handleSwitchMode('login')}
                  className="flex items-center justify-center gap-1.5 mx-auto font-extrabold text-slate-900 hover:underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              ) : mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleSwitchMode('signup')}
                    className="font-extrabold text-slate-900 hover:underline transition-colors ml-1"
                  >
                    Sign Up &gt;
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => handleSwitchMode('login')}
                    className="font-extrabold text-slate-900 hover:underline transition-colors ml-1"
                  >
                    Sign In &gt;
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
