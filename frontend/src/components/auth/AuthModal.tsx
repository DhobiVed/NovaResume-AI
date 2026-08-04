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

const API = 'http://127.0.0.1:8000/api/v1/auth';

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
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.toLowerCase().trim(), password })
      });
      const data = await res.json();
      if (!res.ok) return setFieldError('email', data.detail || 'Registration failed');

      // Save tokens from registration response
      if (data.access_token) localStorage.setItem('nova_auth_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('nova_refresh_token', data.refresh_token);

      // Immediately log user in after registration
      onLoginSuccess(data.user);
      onClose();
    } catch {
      setFieldError('email', 'Cannot connect to server. Is the backend running?');
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
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      const data = await res.json();
      if (!res.ok) return setFieldError('email', data.detail || 'Invalid email or password');

      if (data.access_token) localStorage.setItem('nova_auth_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('nova_refresh_token', data.refresh_token);

      onLoginSuccess(data.user);
      onClose();
    } catch {
      setFieldError('email', 'Cannot connect to server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Please enter your registered email address');

    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      const data = await res.json();

      if (data.reset_token) {
        // Dev mode: token returned in response — pre-fill the reset form
        setResetToken(data.reset_token);
        setSuccessMsg('Reset token generated. Enter it below along with your new password (dev mode — in production this would be emailed).');
        setMode('reset');
      } else {
        setSuccessMsg(data.message || 'If an account exists with that email, a reset link has been sent.');
      }
    } catch {
      setFieldError('email', 'Cannot connect to server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) return setFieldError('resetToken', 'Reset token is required');
    if (!newPassword || newPassword.length < 6) return setFieldError('newPassword', 'New password must be at least 6 characters');
    if (newPassword !== confirmNewPassword) return setFieldError('confirmNewPassword', 'Passwords do not match');

    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) return setFieldError('resetToken', data.detail || 'Invalid or expired token');

      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetToken('');
      setTimeout(() => setMode('login'), 2000);
    } catch {
      setFieldError('resetToken', 'Cannot connect to server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
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
