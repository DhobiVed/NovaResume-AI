import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight,
  AlertCircle, KeyRound, ArrowLeft
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
    }, 180);
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

  // ── AUTHENTICATION HANDLERS (LOGIC UNCHANGED) ───────────────────────

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

  // ── FORM HEADER LABELS ────────────────────────────────────
  const titles = {
    login: 'Welcome Back to NovaResume',
    signup: 'Create Your Free Account',
    forgot: 'Reset Your Password',
    reset: 'Set New Password'
  };
  const subtitles = {
    login: 'Sign in to access your resumes, portfolios & AI mentor',
    signup: 'Build ATS-proof resumes with AI — free forever',
    forgot: "Enter your email and we'll send you a reset link",
    reset: 'Enter the reset token and your new password'
  };
  const btnLabels = {
    login: 'Sign In to Account',
    signup: 'Create Account',
    forgot: 'Send Reset Link',
    reset: 'Save New Password'
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-8 transform-gpu">
      
      {/* 1. Full-Screen Translucent Backdrop with Motion Blur */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-400 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* 2. Full-Screen Floating Glassmorphic Authentication Card */}
      <div
        className={`bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[32px] w-full max-w-md shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35),0_0_50px_rgba(5,150,105,0.15)] p-6 sm:p-9 relative flex flex-col transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 max-h-[92vh] overflow-y-auto ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 p-2 bg-slate-100/80 hover:bg-slate-200/80 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200 active:scale-90 z-20"
          aria-label="Close authentication screen"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Morphing Form Container */}
        <div className={`transition-all duration-300 transform-gpu ${isSwitchingMode ? 'opacity-0 scale-98 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}`}>

          {/* Header */}
          <div className="text-center space-y-1.5 mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-600/30 mb-4 animate-float">
              N
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{titles[mode]}</h2>
            <p className="text-xs font-semibold text-slate-500">{subtitles[mode]}</p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pure Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name — signup only */}
            {mode === 'signup' && (
              <div className={`space-y-1.5 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={`w-full pl-10 pr-3.5 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.fullName && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</span>}
              </div>
            )}

            {/* Email Address — login, signup, forgot */}
            {mode !== 'reset' && (
              <div className={`space-y-1.5 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3.5 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.email && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</span>}
              </div>
            )}

            {/* Reset Token — reset mode */}
            {mode === 'reset' && (
              <div className={`space-y-1.5 ${shakingField === 'resetToken' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">Reset Token</label>
                <div className="relative group">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    className={`w-full pl-10 pr-3.5 py-3 bg-slate-50 border rounded-2xl text-sm font-mono focus:outline-none transition-all duration-200 ${
                      errors.resetToken ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.resetToken && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.resetToken}</span>}
              </div>
            )}

            {/* Password — login, signup */}
            {(mode === 'login' || mode === 'signup') && (
              <div className={`space-y-1.5 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
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

            {/* Confirm Password — signup */}
            {mode === 'signup' && (
              <div className={`space-y-1.5 ${shakingField === 'confirmPassword' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                      errors.confirmPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</span>}
              </div>
            )}

            {/* New Password & Confirm — reset mode */}
            {mode === 'reset' && (
              <>
                <div className={`space-y-1.5 ${shakingField === 'newPassword' ? 'animate-shake' : ''}`}>
                  <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">New Password</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        errors.newPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.newPassword}</span>}
                </div>

                <div className={`space-y-1.5 ${shakingField === 'confirmNewPassword' ? 'animate-shake' : ''}`}>
                  <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative group">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold focus:outline-none transition-all duration-200 ${
                        errors.confirmNewPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200/90 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmNewPassword}</span>}
                </div>
              </>
            )}

            {/* Premium Submit Button with Micro-Press Ripple */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-emerald-600/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50 mt-5 tracking-wide transform-gpu"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{btnLabels[mode]}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer & Mode Morph Triggers */}
          <div className="pt-5 mt-5 border-t border-slate-100 text-center text-xs font-semibold text-slate-600">
            {(mode === 'forgot' || mode === 'reset') ? (
              <button
                onClick={() => handleSwitchMode('login')}
                className="flex items-center justify-center gap-1.5 mx-auto font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            ) : mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => handleSwitchMode('signup')}
                  className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors ml-1"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => handleSwitchMode('login')}
                  className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
