import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight,
  AlertCircle, KeyRound, ArrowLeft
} from 'lucide-react';

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

import { firebaseAuthService } from '../../services/firebaseAuth';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

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

  // Sync mode on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setSuccessMsg(null);
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }, [isOpen, initialMode]);

  // ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Password Strength (0-4)
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

  // ── HANDLERS ────────────────────────────────────────────────

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
      setMode('login');
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
      onClose();
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
    setTimeout(() => setMode('login'), 3000);
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const userProfile = await firebaseAuthService.loginWithGoogle();
      if (userProfile) {
        onLoginSuccess(userProfile);
        onClose();
      }
    } catch (err: any) {
      let msg = 'Google Sign-In failed.';
      if (err?.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing.';
      } else if (err?.code === 'auth/popup-blocked') {
        msg = 'Popup was blocked by your browser. Retrying in redirect mode...';
      }
      setFieldError('email', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-[24px] w-full max-w-md shadow-2xl p-6 sm:p-8 relative flex flex-col transform transition-all duration-300 animate-scaleUp max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg mb-3">
            N
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{titles[mode]}</h2>
          <p className="text-xs font-semibold text-slate-500">{subtitles[mode]}</p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="space-y-3 mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50 min-h-[42px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold uppercase text-slate-400 absolute">Or with email</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>

          {/* Full Name — signup only */}
          {mode === 'signup' && (
            <div className={`space-y-1 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
              <label className="text-[11px] font-extrabold text-slate-700 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.fullName && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</span>}
            </div>
          )}

          {/* Email — login, signup, forgot */}
          {mode !== 'reset' && (
            <div className={`space-y-1 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
              <label className="text-[11px] font-extrabold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.email && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</span>}
            </div>
          )}

          {/* Reset Token — reset mode */}
          {mode === 'reset' && (
            <div className={`space-y-1 ${shakingField === 'resetToken' ? 'animate-shake' : ''}`}>
              <label className="text-[11px] font-extrabold text-slate-700 block">Reset Token</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste the reset token from your email"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono focus:outline-none transition-all ${
                    errors.resetToken ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.resetToken && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.resetToken}</span>}
            </div>
          )}

          {/* Password — login, signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className={`space-y-1 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrors({}); setSuccessMsg(null); }}
                    className="text-[10px] font-extrabold text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</span>}

              {/* Password Strength Bar */}
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

          {/* New Password — reset mode */}
          {mode === 'reset' && (
            <>
              <div className={`space-y-1 ${shakingField === 'newPassword' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-9 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      errors.newPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.newPassword}</span>}
              </div>

              <div className={`space-y-1 ${shakingField === 'confirmNewPassword' ? 'animate-shake' : ''}`}>
                <label className="text-[11px] font-extrabold text-slate-700 block">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      errors.confirmNewPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmNewPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmNewPassword}</span>}
              </div>
            </>
          )}

          {/* Confirm Password — signup */}
          {mode === 'signup' && (
            <div className={`space-y-1 ${shakingField === 'confirmPassword' ? 'animate-shake' : ''}`}>
              <label className="text-[11px] font-extrabold text-slate-700 block">Confirm Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.confirmPassword ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</span>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 mt-4"
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

        {/* Footer / Back links */}
        <div className="pt-4 mt-4 border-t border-slate-100 text-center text-xs font-semibold text-slate-600">
          {(mode === 'forgot' || mode === 'reset') ? (
            <button
              onClick={() => { setMode('login'); setErrors({}); setSuccessMsg(null); }}
              className="flex items-center justify-center gap-1.5 mx-auto font-extrabold text-emerald-700 hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Sign In
            </button>
          ) : mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setErrors({}); setSuccessMsg(null); }}
                className="font-extrabold text-emerald-700 hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setErrors({}); setSuccessMsg(null); }}
                className="font-extrabold text-emerald-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
