import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight,
  AlertCircle, KeyRound
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
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
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Form Input States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

  // Sync mode with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Password Strength Calculation (0-4 score)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const triggerShake = (field: string) => {
    setShakingField(field);
    setTimeout(() => setShakingField(null), 500);
  };

  // Validate Form
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (mode === 'signup' && !fullName.trim()) {
      errs.fullName = 'Full Name is required';
      triggerShake('fullName');
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
      triggerShake('email');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
      triggerShake('email');
    }

    if (!password) {
      errs.password = 'Password is required';
      triggerShake('password');
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
      triggerShake('password');
    }

    if (mode === 'signup') {
      if (confirmPassword !== password) {
        errs.confirmPassword = 'Passwords do not match';
        triggerShake('confirmPassword');
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMsg(null);

    setTimeout(() => {
      setIsLoading(false);

      if (mode === 'signup') {
        // Sign Up Success Flow -> Switch to Login with Prefilled Email & Toast
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'login') {
        // Login Success Flow -> Close modal & notify parent user state
        const loggedInUser: UserProfile = {
          name: fullName || email.split('@')[0] || 'Ved Dhobi',
          email: email,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        onLoginSuccess(loggedInUser);
        onClose();
      } else if (mode === 'forgot') {
        setSuccessMsg('Password reset link sent to your email!');
        setMode('login');
      }
    }, 900);
  };

  // Google OAuth Simulation
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const googleUser: UserProfile = {
        name: 'Ved Dhobi',
        email: 'veddhobi252@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      onLoginSuccess(googleUser);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Glassmorphism Floating Card */}
      <div
        className="bg-white border border-slate-200/90 rounded-[24px] w-full max-w-md shadow-2xl p-6 sm:p-8 relative flex flex-col transform transition-all duration-300 scale-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg mb-3">
            N
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back to NovaResume' : mode === 'signup' ? 'Create Your Free Account' : 'Reset Your Password'}
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            {mode === 'login' ? 'Sign in to access your resumes, portfolios, and AI mentor' : mode === 'signup' ? 'Join 50,000+ engineers building ATS-proof resumes' : 'Enter your email address to receive a recovery link'}
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Social Login */}
        {mode !== 'forgot' && (
          <div className="space-y-3 mb-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
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

        {/* Dynamic Animated Form Container */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Full Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className={`space-y-1 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
              <label className="text-[11px] font-extrabold text-slate-700 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ved Dhobi"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.fullName && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</span>}
            </div>
          )}

          {/* Email Field */}
          <div className={`space-y-1 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
            <label className="text-[11px] font-extrabold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="veddhobi252@gmail.com"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                  errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.email && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</span>}
          </div>

          {/* Password Field */}
          {mode !== 'forgot' && (
            <div className={`space-y-1 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</span>}

              {/* Password Strength Indicator for Sign Up */}
              {mode === 'signup' && password.length > 0 && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-500">Strength</span>
                    <span className="text-slate-700">{strengthLabels[Math.min(3, passStrength)]}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          step <= passStrength ? strengthColors[passStrength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password Field (Sign Up Only) */}
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</span>}
            </div>
          )}

          {/* Remember Me Checkbox (Login Only) */}
          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>
          )}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : mode === 'signup' ? 'Create Account' : 'Send Recovery Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 text-center text-xs font-semibold text-slate-600">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setErrors({}); }}
                className="font-extrabold text-emerald-700 hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setErrors({}); }}
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
