import React, { useState, useEffect, useRef } from 'react';
import {
  X, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowLeft, Sparkles, ArrowRight, UserCheck, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
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

// ── PREMIUM SUCCESS POPUP OVERLAY ────────────────────────────────────────────
const SignupSuccessPopup: React.FC<{
  onContinue: () => void;
}> = ({ onContinue }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 350);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => {
      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.55 }, colors: ['#0d9488', '#10b981', '#34d399', '#f59e0b', '#6366f1'] });
        setTimeout(() => confetti({ particleCount: 40, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: ['#0d9488', '#10b981'] }), 300);
        setTimeout(() => confetti({ particleCount: 40, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: ['#f59e0b', '#6366f1'] }), 450);
      } catch {}
    }, 200);

    const t3 = setTimeout(() => {
      handleContinue();
    }, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-all duration-400 ease-out ${
      visible && !exiting ? 'bg-slate-950/70 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
    }`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-auto overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible && !exiting ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
      }`}>
        <div className="h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-400" />
        <button
          onClick={handleContinue}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors z-30 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center pt-8 pb-6 px-8 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 border-4 border-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
            </div>
          </div>

          <div className="absolute top-12 left-8 animate-float-badge-1 opacity-60">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="absolute top-16 right-10 animate-float-badge-2 opacity-60">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Account Created! 🎉
          </h2>

          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            Welcome to <span className="font-extrabold text-teal-600">Nova Resume AI</span>.<br />
            Your account has been created successfully.<br />
            Please sign in to continue.
          </p>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-progress-bar" />
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginSuccessPopup: React.FC<{
  name: string;
  onDone: () => void;
}> = ({ name, onDone }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleDone = () => {
    setExiting(true);
    setTimeout(onDone, 350);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => {
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, colors: ['#0d9488', '#10b981', '#34d399'] });
      } catch {}
    }, 200);

    const timer = setTimeout(() => {
      handleDone();
    }, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-all duration-400 ease-out ${
      visible && !exiting ? 'bg-slate-950/70 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
    }`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-auto overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible && !exiting ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
      }`}>
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-400" />
        <button
          onClick={handleDone}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors z-30 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center pt-8 pb-6 px-8 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
            <div className="absolute inset-[-8px] rounded-full border-2 border-teal-300/40 animate-spin-slow" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-emerald-100 border-4 border-teal-500 flex items-center justify-center shadow-xl shadow-teal-200">
              <UserCheck className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            Welcome back, {name}! 👋
          </h2>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Login Successful</span>
          </div>

          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">
            We're happy to see you again!<br />
            Redirecting to your dashboard...
          </p>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN AUTH MODAL COMPONENT ────────────────────────────────────────────────
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

  // ── DESKTOP AUTH SLIDER STATE & AUTO-PLAY ─────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDES = [
    {
      title: 'Start Creating Impact Right Away',
      subtitle: "From AI resume tailoring to job application tracking, let's turn your career goals into measurable results.",
      badge: 'ATS 98%',
      metric1Label: 'ATS Score',
      metric1Val: '98%',
      metric2Label: 'JD Match Rate',
      metric2Val: '92%',
      meterLabel: 'Optimization Meter',
      meterVal: '98 / 100',
      meterWidth: '98%',
      cardIcon: '⚡'
    },
    {
      title: '100% ATS-Safe & Recruiter Approved',
      subtitle: 'Bypass applicant tracking filters with clean vector resumes engineered for Greenhouse, Lever & Workday.',
      badge: 'Recruiter Passed',
      metric1Label: 'Parse Accuracy',
      metric1Val: '100%',
      metric2Label: 'Keywords Found',
      metric2Val: '24 / 24',
      meterLabel: 'ATS Compatibility Score',
      meterVal: '100 / 100',
      meterWidth: '100%',
      cardIcon: '🛡️'
    },
    {
      title: 'Generate Web Portfolios in 1-Click',
      subtitle: 'Transform your resume into a self-contained, high-performance HTML web portfolio website in seconds.',
      badge: 'Web Portfolio Pro',
      metric1Label: 'Portfolio Style',
      metric1Val: 'Dev Pro',
      metric2Label: 'Load Speed',
      metric2Val: '< 100ms',
      meterLabel: 'Mobile & Desktop Responsive',
      meterVal: '100%',
      meterWidth: '100%',
      cardIcon: '🌐'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Smooth Mount / Unmount Controller
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setMode(initialMode);
      setErrors({});
      setShowSignupSuccess(false);
      setShowLoginSuccess(false);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 380);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Graceful Smooth Closing Controller
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => { onClose(); }, 350);
  };

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showSignupSuccess && !showLoginSuccess) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSignupSuccess, showLoginSuccess]);

  // Mode Switching
  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot' | 'reset') => {
    setErrors({});
    setShowSignupSuccess(false);
    setShowLoginSuccess(false);
    setMode(newMode);
  };

  if (!isRendered) return null;

  // Password Strength Calculator
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

  // ── AUTHENTICATION HANDLERS ────────────────────────────────────────────────
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
      const savedEmail = email.toLowerCase().trim();
      setRegisteredEmail(savedEmail);
      setIsLoading(false);
      setShowSignupSuccess(true);
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Registration failed. Please try again.';
      if (err?.code === 'auth/email-already-in-use') msg = 'An account with this email already exists. Please sign in.';
      else if (err?.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      else if (err?.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      setFieldError('email', msg);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Valid email address is required');
    if (!password) return setFieldError('password', 'Password is required');

    setIsLoading(true);
    setErrors({});
    try {
      const userProfile = await firebaseAuthService.login(email.toLowerCase().trim(), password);
      setIsLoading(false);
      setLoggedInUser(userProfile);
      setShowLoginSuccess(true);
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Invalid email address or password.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later or reset your password.';
      }
      setFieldError('email', msg);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setFieldError('email', 'Please enter your registered email address');
    setIsLoading(true);
    setErrors({});
    try {
      await firebaseAuthService.sendPasswordReset(email.toLowerCase().trim());
      setIsLoading(false);
      setErrors({ success: `✅ Password reset email sent to ${email.toLowerCase().trim()}! Check your inbox.` });
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Failed to send password reset email.';
      if (err?.code === 'auth/user-not-found') msg = 'No account found with this email address.';
      setFieldError('email', msg);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) return setFieldError('resetToken', 'Reset token is required');
    if (!password || password.length < 6) return setFieldError('password', 'Minimum 6 characters required');
    if (password !== confirmPassword) return setFieldError('confirmPassword', 'Passwords do not match');
    setErrors({ success: 'Password updated! Please sign in with your new password.' });
    setTimeout(() => handleSwitchMode('login'), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') handleSignup();
    else if (mode === 'login') handleLogin();
    else if (mode === 'forgot') handleForgotPassword();
    else if (mode === 'reset') handleResetPassword();
  };

  const handleSignupSuccessContinue = () => {
    setShowSignupSuccess(false);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail(registeredEmail);
    setMode('login');
    setTimeout(() => { passwordInputRef.current?.focus(); }, 400);
  };

  const handleLoginSuccessDone = () => {
    setShowLoginSuccess(false);
    if (loggedInUser) onLoginSuccess(loggedInUser);
    handleClose();
  };

  return (
    <>
      {/* ── SIGNUP SUCCESS POPUP ── */}
      {showSignupSuccess && (
        <SignupSuccessPopup onContinue={handleSignupSuccessContinue} />
      )}

      {/* ── LOGIN SUCCESS POPUP ── */}
      {showLoginSuccess && loggedInUser && (
        <LoginSuccessPopup
          name={loggedInUser.name || loggedInUser.email.split('@')[0] || 'User'}
          onDone={handleLoginSuccessDone}
        />
      )}

      {/* ── DESKTOP & LAPTOP AUTHENTICATION VIEW (≥ 1024px) — 100% UNCHANGED ── */}
      <div className={`hidden lg:flex fixed inset-0 z-[99999] overflow-hidden bg-slate-950 flex-col justify-between w-screen h-screen transform-gpu transition-all duration-400 ease-out select-none ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>

        {/* ── 1. TOP SAAS HEADER BAR ── */}
        <header className="h-16 px-8 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-30 flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSwitchMode('login')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-900/40">
              N
            </div>
            <div>
              <h1 className="font-black text-lg text-white tracking-wide flex items-center gap-2">
                <span>NovaResume AI</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] uppercase border border-teal-500/30">
                  SaaS Auth Platform
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl relative shadow-inner">
            <button
              onClick={() => handleSwitchMode('login')}
              className={`px-5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 relative z-10 cursor-pointer ${
                mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleSwitchMode('signup')}
              className={`px-5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 relative z-10 cursor-pointer ${
                mode === 'signup' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-teal-600 rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
                mode === 'signup' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
            />
          </div>

          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-700/60"
          >
            <span>Back to Platform</span>
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* ── 2. DUAL SLIDING PANELS (DESKTOP) ── */}
        <main className="flex-1 relative overflow-hidden bg-slate-950 flex flex-row">
          <div
            className={`flex absolute top-0 bottom-0 w-1/2 bg-[#074b56] bg-gradient-to-br from-[#063d47] via-[#095b68] to-[#04282f] p-10 lg:p-14 flex-col justify-between text-white z-20 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu border-teal-500/20 ${
              mode === 'signup'
                ? 'left-0 rounded-r-[36px] border-r'
                : 'left-1/2 rounded-l-[36px] border-l'
            }`}
          >
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            {/* Slide Header Text with Smooth Animation */}
            <div className="relative z-10 min-h-[130px] flex flex-col justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/20 shadow-lg backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-teal-200 animate-pulse" />
              </div>
              <div key={currentSlide} className="space-y-2 animate-fadeIn transition-all duration-500">
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                  {SLIDES[currentSlide].title}
                </h2>
                <p className="text-sm text-teal-100/90 leading-relaxed max-w-md font-medium">
                  {SLIDES[currentSlide].subtitle}
                </p>
              </div>
            </div>

            {/* Slide Interactive Card with Animated Transitions */}
            <div className="relative my-auto py-6 flex items-center justify-center z-10">
              <div
                key={currentSlide}
                className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/80 text-slate-900 transition-all duration-500 transform hover:scale-[1.03] animate-slideUp"
              >
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white text-sm font-black shadow-md">
                      {SLIDES[currentSlide].cardIcon}
                    </div>
                    <span className="text-sm font-black text-slate-900">NovaResume AI Engine</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase shadow-xs">
                    {SLIDES[currentSlide].badge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block truncate">{SLIDES[currentSlide].metric1Label}</span>
                    <span className="text-base font-black text-slate-900">{SLIDES[currentSlide].metric1Val}</span>
                  </div>
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block truncate">{SLIDES[currentSlide].metric2Label}</span>
                    <span className="text-base font-black text-emerald-600">{SLIDES[currentSlide].metric2Val}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>{SLIDES[currentSlide].meterLabel}</span>
                    <span className="text-teal-600">{SLIDES[currentSlide].meterVal}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: SLIDES[currentSlide].meterWidth }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Pagination Bullets / Dots Indicator */}
            <div className="flex items-center justify-between z-10 pt-2 border-t border-teal-500/30">
              <div className="flex items-center gap-2">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-white shadow-md' : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-teal-200/70 font-bold tracking-wider uppercase">
                © NovaResume AI 2026
              </div>
            </div>
          </div>

          <div className="w-full h-full flex flex-row relative">
            {/* Sign In Left */}
            <div className={`w-1/2 h-full p-14 flex flex-col justify-center bg-slate-900 overflow-y-auto transition-all duration-400 ease-out transform-gpu ${
              mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-40 pointer-events-none'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {mode === 'forgot' ? 'Reset Password' : mode === 'reset' ? 'Set New Password' : 'Sign in to NovaResume'}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">
                    {mode === 'forgot' ? 'Enter your registered email to receive a reset link' : 'Access your AI resumes, job tracker & web portfolio'}
                  </p>
                </div>

                {errors.success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{errors.success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {mode !== 'reset' && (
                    <div className={`space-y-1.5 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                      <label className="text-xs font-extrabold text-slate-300 block">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${
                          errors.email ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                        }`}
                      />
                      {errors.email && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</span>}
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className={`space-y-1.5 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold text-slate-300">Password</label>
                        <button type="button" onClick={() => handleSwitchMode('forgot')} className="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline transition-colors cursor-pointer">
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full pl-4 pr-11 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${
                            errors.password ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                          }`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</span>}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-900/30 transition-all duration-200 flex items-center justify-center gap-2.5 min-h-[52px] disabled:opacity-50 mt-6 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'forgot' ? 'Send Reset Link' : mode === 'reset' ? 'Update Password' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-800/80 text-center text-xs font-semibold text-slate-400">
                  {mode === 'login' ? (
                    <p>Don't have an account?{' '}
                      <button type="button" onClick={() => handleSwitchMode('signup')} className="font-extrabold text-teal-400 hover:text-teal-300 hover:underline ml-1 cursor-pointer">
                        Sign Up &gt;
                      </button>
                    </p>
                  ) : (
                    <button type="button" onClick={() => handleSwitchMode('login')} className="flex items-center justify-center gap-1.5 mx-auto font-extrabold text-slate-300 hover:text-white transition-colors cursor-pointer">
                      <ArrowLeft className="w-3.5 h-3.5" />Back to Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sign Up Right */}
            <div className={`w-1/2 h-full p-14 flex flex-col justify-center bg-slate-900 overflow-y-auto transition-all duration-400 ease-out transform-gpu ${
              mode === 'signup' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-40 pointer-events-none'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Create NovaResume Account</h2>
                  <p className="text-sm text-slate-400 font-medium">Build ATS-proof resumes with AI & launch your portfolio — free forever</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                  <div className={`space-y-1.5 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                      className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.fullName ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                    {errors.fullName && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</span>}
                  </div>

                  <div className={`space-y-1.5 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                      className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.email ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                    {errors.email && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</span>}
                  </div>

                  <div className={`space-y-1.5 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password"
                        className={`w-full pl-4 pr-11 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.password ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</span>}
                  </div>

                  <div className={`space-y-1.5 ${shakingField === 'confirmPassword' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
                        className={`w-full pl-4 pr-11 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.confirmPassword ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-900/30 transition-all duration-200 flex items-center justify-center gap-2.5 min-h-[52px] disabled:opacity-50 mt-6 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account &amp; Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-800/80 text-center text-xs font-semibold text-slate-400">
                  <p>Already have an account?{' '}
                    <button type="button" onClick={() => handleSwitchMode('login')} className="font-extrabold text-teal-400 hover:text-teal-300 hover:underline ml-1 cursor-pointer">
                      Sign In &gt;
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── DEDICATED MOBILE & SMALL TABLET AUTHENTICATION VIEW (< 1024px) ── */}
      <div className={`flex lg:hidden fixed inset-0 z-[99999] overflow-y-auto bg-white text-slate-900 flex-col justify-between w-screen h-screen pt-safe pb-safe transition-all duration-300 ease-out select-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        
        {/* Mobile Header Bar */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSwitchMode('login')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              N
            </div>
            <div>
              <h1 className="font-black text-base text-slate-900 tracking-tight leading-none">NovaResume AI</h1>
              <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider block mt-0.5">SaaS Platform</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Screen Switcher Tabs */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex-shrink-0">
          <div className="flex p-1 bg-slate-200/80 rounded-2xl relative shadow-inner">
            <button
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 z-10 cursor-pointer ${
                mode === 'login' || mode === 'forgot' || mode === 'reset' ? 'text-white bg-emerald-600 shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 z-10 cursor-pointer ${
                mode === 'signup' ? 'text-white bg-emerald-600 shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Mobile Page Content Container with Smooth Slide & Fade (250-350ms) */}
        <main className="flex-1 p-5 sm:p-8 flex flex-col justify-between max-w-md mx-auto w-full overflow-y-auto">
          <div className="space-y-5 animate-fadeIn">

            {/* Screen Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'signup' ? 'Create Your Account 🚀' : mode === 'forgot' ? 'Reset Password 🔑' : mode === 'reset' ? 'New Password 🔒' : 'Welcome Back! 👋'}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {mode === 'signup'
                  ? 'Build Canva-quality, ATS-passed resumes in seconds'
                  : mode === 'forgot'
                  ? 'Enter your registered email address below'
                  : mode === 'reset'
                  ? 'Enter reset token and your new password'
                  : 'Sign in to access your resumes & AI mentor'}
              </p>
            </div>

            {/* Success Notice Banner */}
            {errors.success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{errors.success}</span>
              </div>
            )}

            {/* Mobile Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

              {/* Full Name — Sign Up */}
              {mode === 'signup' && (
                <div className={`space-y-1 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-extrabold text-slate-700 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Vance"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-colors min-h-[48px] ${
                      errors.fullName ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
                </div>
              )}

              {/* Email Address */}
              {mode !== 'reset' && (
                <div className={`space-y-1 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-extrabold text-slate-700 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-colors min-h-[48px] ${
                      errors.email ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
              )}

              {/* Reset Token */}
              {mode === 'reset' && (
                <div className={`space-y-1 ${shakingField === 'resetToken' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-extrabold text-slate-700 block">Reset Token</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-colors min-h-[48px] ${
                      errors.resetToken ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  {errors.resetToken && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.resetToken}</p>}
                </div>
              )}

              {/* Password — Login or Signup */}
              {(mode === 'login' || mode === 'signup') && (
                <div className={`space-y-1 ${shakingField === 'password' ? 'animate-shake' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700 block">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot')}
                        className="text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pr-11 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-colors min-h-[48px] ${
                        errors.password ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Password Strength</span>
                        <span className="text-emerald-700">{strengthLabels[Math.min(3, strength)]}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                        {[0, 1, 2, 3].map((step) => (
                          <div key={step} className={`h-full flex-1 rounded-full transition-all duration-300 ${step <= strength ? strengthColors[Math.min(3, strength)] : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password — Signup */}
              {mode === 'signup' && (
                <div className={`space-y-1 ${shakingField === 'confirmPassword' ? 'animate-shake' : ''}`}>
                  <label className="text-xs font-extrabold text-slate-700 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pr-11 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-colors min-h-[48px] ${
                        errors.confirmPassword ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : mode === 'reset' ? 'Update Password' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Switcher Link */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500 mt-6">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-black text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className="font-black text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};
