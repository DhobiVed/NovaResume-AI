import React, { useState, useEffect, useRef } from 'react';
import {
  X, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowLeft, Sparkles, ShieldCheck, Briefcase, Globe, FileText, Zap, ArrowRight, UserCheck, Star
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

  useEffect(() => {
    // Entrance animation
    const t1 = setTimeout(() => setVisible(true), 20);
    // Confetti burst
    const t2 = setTimeout(() => {
      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.55 }, colors: ['#0d9488', '#10b981', '#34d399', '#f59e0b', '#6366f1'] });
        setTimeout(() => confetti({ particleCount: 40, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: ['#0d9488', '#10b981'] }), 300);
        setTimeout(() => confetti({ particleCount: 40, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: ['#f59e0b', '#6366f1'] }), 450);
      } catch {}
    }, 200);
    // Auto-advance after 3s if user hasn't clicked
    const t3 = setTimeout(() => { handleContinue(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 350);
  };

  return (
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-all duration-400 ease-out ${
      visible && !exiting ? 'bg-slate-950/70 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
    }`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-auto overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible && !exiting ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
      }`}>

        {/* X Close Button */}
        <button
          onClick={handleContinue}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top green gradient bar */}
        <div className="h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-400" />

        {/* Soft glow ring behind icon */}
        <div className="flex flex-col items-center pt-8 pb-6 px-8 text-center">
          {/* Animated success icon */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 border-4 border-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Floating sparkles */}
          <div className="absolute top-12 left-8 animate-float-badge-1 opacity-60">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="absolute top-16 right-10 animate-float-badge-2 opacity-60">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <div className="absolute top-24 left-12 animate-float-badge-2 opacity-40">
            <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Account Created! 🎉
          </h2>

          {/* Body */}
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            Welcome to <span className="font-extrabold text-teal-600">Nova Resume AI</span>.<br />
            Your account has been created successfully.<br />
            Please sign in to continue.
          </p>

          {/* Progress bar — auto-advances in 3s */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ animation: 'progressBar 3s linear forwards' }} />
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 font-medium mt-3">
            Auto-redirecting in a few seconds...
          </p>
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

  const handleDismiss = () => {
    if (!exiting) {
      setExiting(true);
      setTimeout(onDone, 350);
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    // Subtle confetti for login too
    const t2 = setTimeout(() => {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ['#0d9488', '#10b981', '#34d399'] });
      } catch {}
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    // Auto-dismiss after 3s
    const timer = setTimeout(handleDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-all duration-400 ease-out ${
      visible && !exiting ? 'bg-slate-950/70 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
    }`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-auto overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible && !exiting ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
      }`}>

        {/* X Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-400" />

        <div className="flex flex-col items-center pt-8 pb-6 px-8 text-center">
          {/* Animated success icon with pulse ring */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
            <div className="absolute inset-[-8px] rounded-full border-2 border-teal-300/40 animate-spin-slow" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-emerald-100 border-4 border-teal-500 flex items-center justify-center shadow-xl shadow-teal-200">
              <UserCheck className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Floating sparkles */}
          <div className="absolute top-12 left-8 animate-float-badge-2 opacity-60">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="absolute top-20 right-10 animate-float-badge-1 opacity-60">
            <Star className="w-4 h-4 text-teal-400 fill-teal-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
            Welcome back, {name}! 👋
          </h2>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Login Successful</span>
          </div>

          {/* Body */}
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">
            We're happy to see you again!<br />
            Redirecting to your dashboard...
          </p>

          {/* Auto-progress bar — fills in 3s */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ animation: 'progressBar 3s linear forwards' }} />
          </div>

          {/* Loading dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN AUTH MODAL ───────────────────────────────────────────────────────────
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  // Animation States
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Success Popup States
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

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
      // Show premium signup success popup
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
      // Show premium login success popup
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
    if (!newPassword || newPassword.length < 6) return setFieldError('newPassword', 'Minimum 6 characters required');
    if (newPassword !== confirmNewPassword) return setFieldError('confirmNewPassword', 'Passwords do not match');
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

  // After signup popup "Continue to Login" clicked
  const handleSignupSuccessContinue = () => {
    setShowSignupSuccess(false);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail(registeredEmail);
    setMode('login');
    setTimeout(() => { passwordInputRef.current?.focus(); }, 400);
  };

  // After login popup auto-dismisses
  const handleLoginSuccessDone = () => {
    setShowLoginSuccess(false);
    if (loggedInUser) onLoginSuccess(loggedInUser);
    handleClose();
  };

  return (
    <>
      {/* ── SIGNUP SUCCESS POPUP (full-screen overlay, z above everything) ── */}
      {showSignupSuccess && (
        <SignupSuccessPopup onContinue={handleSignupSuccessContinue} />
      )}

      {/* ── LOGIN SUCCESS POPUP (full-screen overlay, z above everything) ── */}
      {showLoginSuccess && loggedInUser && (
        <LoginSuccessPopup
          name={loggedInUser.name || loggedInUser.email.split('@')[0] || 'User'}
          onDone={handleLoginSuccessDone}
        />
      )}

      {/* ── MAIN FULL-SCREEN AUTH CONTAINER ── */}
      <div className={`fixed inset-0 z-[99999] overflow-hidden bg-slate-950 flex flex-col justify-between w-screen h-screen transform-gpu transition-all duration-400 ease-out select-none ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>

        {/* ── 1. TOP SAAS HEADER BAR ── */}
        <header className="h-16 px-4 md:px-8 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-30 flex-shrink-0 backdrop-blur-md">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSwitchMode('login')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-900/40">
              N
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg text-white tracking-wide flex items-center gap-2">
                <span>NovaResume AI</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] uppercase border border-teal-500/30 hidden sm:inline-block">
                  SaaS Auth Platform
                </span>
              </h1>
            </div>
          </div>

          {/* Mode Toggle Pill */}
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

          {/* Close */}
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-700/60"
          >
            <span className="hidden sm:inline">Back to Platform</span>
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* ── 2. DUAL SLIDING PANELS ── */}
        <main className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col md:flex-row">

          {/* ── SLIDING SHOWCASE OVERLAY PANEL ── */}
          {/* mode=login → sits RIGHT (left-1/2), reveals Sign In form on LEFT */}
          {/* mode=signup → sits LEFT (left-0), reveals Sign Up form on RIGHT */}
          <div
            className={`hidden md:flex absolute top-0 bottom-0 w-1/2 bg-[#074b56] bg-gradient-to-br from-[#063d47] via-[#095b68] to-[#04282f] p-10 lg:p-14 flex-col justify-between text-white z-20 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu border-teal-500/20 ${
              mode === 'signup'
                ? 'left-0 rounded-r-[36px] border-r'
                : 'left-1/2 rounded-l-[36px] border-l'
            }`}
          >
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5 border border-white/20 shadow-lg backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-teal-200" />
              </div>
              {mode === 'signup' ? (
                <div className="space-y-3">
                  <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                    Unlock The Full Power<br />of NovaResume AI
                  </h2>
                  <p className="text-sm text-teal-100/80 leading-relaxed max-w-md font-medium">
                    Just a few simple steps and you'll be ready to automate, optimize, and craft ATS-proof resumes like never before.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                    Start Creating Impact<br />Right Away
                  </h2>
                  <p className="text-sm text-teal-100/80 leading-relaxed max-w-md font-medium">
                    From AI resume tailoring to job application tracking, let's turn your career goals into measurable results.
                  </p>
                </div>
              )}
            </div>

            {/* Metrics card + floating badges */}
            <div className="relative my-auto py-8 flex items-center justify-center z-10">
              <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-white/80 text-slate-900 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-teal-600 flex items-center justify-center text-white text-xs font-black shadow-md">N</div>
                    <span className="text-sm font-black text-slate-900">NovaResume AI Engine</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">ATS 98%</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">ATS Score</span>
                    <span className="text-base font-black text-slate-900">98%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">JD Match Rate</span>
                    <span className="text-base font-black text-emerald-600">92%</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Optimization Meter</span>
                    <span className="text-teal-600">98 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full w-[98%] rounded-full" />
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-2 -left-3 bg-white text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-float-badge-1">
                <Sparkles className="w-4 h-4 text-amber-500" /><span>AI Mentor</span>
              </div>
              <div className="absolute -top-4 -right-3 bg-white text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-float-badge-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /><span>ATS 100%</span>
              </div>
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 bg-white text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-float-badge-2">
                <FileText className="w-4 h-4 text-teal-600" /><span>PDF Export</span>
              </div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-white text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-float-badge-1">
                <Briefcase className="w-4 h-4 text-blue-500" /><span>Job Tracker</span>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white text-slate-800 text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2 animate-float-badge-1">
                <Globe className="w-4 h-4 text-purple-500" /><span>Portfolios</span>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-teal-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-full shadow-xl flex items-center gap-2 animate-float-badge-2">
                <Zap className="w-4 h-4 text-yellow-300" /><span>Multi-Template</span>
              </div>
            </div>

            <div className="text-xs text-teal-200/60 font-bold tracking-wider uppercase z-10">
              © NovaResume AI 2026. Enterprise SaaS Architecture
            </div>
          </div>

          {/* ── FORM PANELS (LEFT: Sign In, RIGHT: Sign Up) ── */}
          <div className="w-full h-full flex flex-col md:flex-row relative">

            {/* ── SIGN IN FORM PANEL (LEFT) ── */}
            <div className={`w-full md:w-1/2 h-full p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-slate-900 overflow-y-auto transition-all duration-400 ease-out transform-gpu ${
              mode === 'login' || mode === 'forgot' || mode === 'reset'
                ? 'opacity-100 pointer-events-auto z-10'
                : 'opacity-0 md:opacity-40 pointer-events-none md:pointer-events-none'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-6">

                {/* Form Title */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {mode === 'forgot' ? 'Reset Password' : mode === 'reset' ? 'Set New Password' : 'Sign in to NovaResume'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    {mode === 'forgot'
                      ? 'Enter your registered email to receive a reset link'
                      : 'Access your AI resumes, job tracker & web portfolio'}
                  </p>
                </div>

                {/* Success/info banner */}
                {errors.success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{errors.success}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                  {/* Email */}
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

                  {/* Reset token */}
                  {mode === 'reset' && (
                    <div className={`space-y-1.5 ${shakingField === 'resetToken' ? 'animate-shake' : ''}`}>
                      <label className="text-xs font-extrabold text-slate-300 block">Reset Token</label>
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste reset token from email"
                        className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${
                          errors.resetToken ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                        }`}
                      />
                      {errors.resetToken && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.resetToken}</span>}
                    </div>
                  )}

                  {/* Password — login only */}
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

                  {/* New password — reset mode */}
                  {mode === 'reset' && (
                    <>
                      <div className={`space-y-1.5 ${shakingField === 'newPassword' ? 'animate-shake' : ''}`}>
                        <label className="text-xs font-extrabold text-slate-300 block">New Password</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters"
                            className={`w-full pl-4 pr-11 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.newPassword ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-4 text-slate-400 hover:text-white cursor-pointer">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.newPassword && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.newPassword}</span>}
                      </div>
                      <div className={`space-y-1.5 ${shakingField === 'confirmNewPassword' ? 'animate-shake' : ''}`}>
                        <label className="text-xs font-extrabold text-slate-300 block">Confirm New Password</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••"
                            className={`w-full pl-4 pr-11 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.confirmNewPassword ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-4 text-slate-400 hover:text-white cursor-pointer">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.confirmNewPassword && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmNewPassword}</span>}
                      </div>
                    </>
                  )}

                  {/* Submit */}
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

                {/* Bottom switch */}
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

            {/* ── SIGN UP FORM PANEL (RIGHT) ── */}
            <div className={`w-full md:w-1/2 h-full p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-slate-900 overflow-y-auto transition-all duration-400 ease-out transform-gpu ${
              mode === 'signup'
                ? 'opacity-100 pointer-events-auto z-10'
                : 'opacity-0 md:opacity-40 pointer-events-none md:pointer-events-none'
            }`}>
              <div className="max-w-md mx-auto w-full space-y-6">

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create NovaResume Account</h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">Build ATS-proof resumes with AI & launch your portfolio — free forever</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

                  {/* Full Name */}
                  <div className={`space-y-1.5 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                      className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.fullName ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                    {errors.fullName && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</span>}
                  </div>

                  {/* Email */}
                  <div className={`space-y-1.5 ${shakingField === 'email' ? 'animate-shake' : ''}`}>
                    <label className="text-xs font-extrabold text-slate-300 block">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                      className={`w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-all duration-200 min-h-[50px] ${errors.email ? 'border-rose-500 bg-rose-950/20' : 'border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                    {errors.email && <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</span>}
                  </div>

                  {/* Password */}
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
                    {password.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Strength</span>
                          <span className="text-slate-300">{strengthLabels[Math.min(3, strength)]}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                          {[0, 1, 2, 3].map((step) => (
                            <div key={step} className={`h-full flex-1 rounded-full transition-all duration-300 ${step <= strength ? strengthColors[Math.min(3, strength)] : 'bg-slate-800'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
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

                  {/* Submit */}
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

                {/* Bottom switch */}
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
    </>
  );
};
