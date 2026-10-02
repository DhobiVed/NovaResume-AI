import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2,
  GraduationCap, BookOpen, Building2, BarChart3, ShieldAlert, Zap,
  ExternalLink, Lock
} from 'lucide-react';
import { DEMO_ROLES_CATALOG, careerConnectService } from '../../services/careerConnectService';
import type { UserRoleType, AuthUserSession } from '../../types/careerConnect';
import { ThemeToggle } from '../common/ThemeToggle';

interface Props {
  savedRole: UserRoleType;
  onSuccess: (session: AuthUserSession) => void;
  onSwitchRole: () => void;           // takes user to Role Selection page (evaluator tool)
  onNavigateToNova: () => void;
}

const ROLE_META_MAP: Record<UserRoleType, {
  title: string;
  tagline: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  buttonBg: string;
  accentColor: string;
  defaultEmail: string;
}> = {
  student: {
    title: 'Student Career Portal',
    tagline: 'Build skills, take 50-Q verified assessments, and unlock industry placement opportunities.',
    icon: <GraduationCap className="w-8 h-8 text-emerald-700" />,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    accentColor: 'text-emerald-700',
    defaultEmail: 'student@novaconnect.edu'
  },
  academician: {
    title: 'Faculty & Academician Portal',
    tagline: 'Monitor department skill matrices, verify student competencies, and curate question banks.',
    icon: <BookOpen className="w-8 h-8 text-purple-700" />,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
    accentColor: 'text-purple-700',
    defaultEmail: 'faculty@gecmodasa.ac.in'
  },
  industry: {
    title: 'Industry & Recruiter Hub',
    tagline: 'Publish opportunities with external Google Forms or internal ATS, and discover verified talent.',
    icon: <Building2 className="w-8 h-8 text-blue-700" />,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    accentColor: 'text-blue-700',
    defaultEmail: 'recruiter@google.com'
  },
  institution: {
    title: 'Institution Admin Console',
    tagline: 'Institutional curriculum governance, accreditation matrices, and industry placement linkages.',
    icon: <BarChart3 className="w-8 h-8 text-amber-700" />,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    accentColor: 'text-amber-700',
    defaultEmail: 'admin@gecmodasa.ac.in'
  },
  super_admin: {
    title: 'Super Admin Console',
    tagline: 'National technical platform governance, institute registry, and systemic security oversight.',
    icon: <ShieldAlert className="w-8 h-8 text-rose-700" />,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    buttonBg: 'bg-rose-600 hover:bg-rose-700',
    accentColor: 'text-rose-700',
    defaultEmail: 'superadmin@ayush.gov.in'
  }
};

export const ReturningUserLoginPage: React.FC<Props> = ({
  savedRole,
  onSuccess,
  onSwitchRole,
  onNavigateToNova,
}) => {
  const meta = ROLE_META_MAP[savedRole] || ROLE_META_MAP.student;

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState(meta.defaultEmail);
  const [password, setPassword] = useState('demo123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setEmail(meta.defaultEmail);
    setPassword('demo123456');
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode('login');
  }, [savedRole, meta.defaultEmail]);

  const handleFillDemo = () => {
    const demoDef = DEMO_ROLES_CATALOG.find(d => d.role === savedRole) || DEMO_ROLES_CATALOG[0];
    setEmail(demoDef.email);
    setPassword('demo123456');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(`Password reset link has been dispatched to ${email.trim()} for ${meta.title}. Please check your inbox.`);
      }, 700);
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const session = await careerConnectService.loginWithRole(email, password, savedRole);
      try {
        localStorage.setItem('novaresume_has_registered', 'true');
        localStorage.setItem('novaresume_saved_role', savedRole);
      } catch {}
      onSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen glass-canvas text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
      {/* ── TOP HEADER ── */}
      <header className="h-16 px-3 sm:px-6 md:px-10 glass-header flex items-center justify-between z-20 flex-shrink-0 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
            N
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">Nova CareerConnect</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase glass-pill flex-shrink-0 ${meta.accentColor}`}>
                {savedRole.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">SIH 26044 · Academia–Industry Integrated Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={onNavigateToNova}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <span>Nova AI</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* ── CENTERED ROLE LOGIN CARD ── */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          
          {/* Role Header Banner */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 rounded-2xl glass-pill shadow-xs">
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {mode === 'forgot' ? 'Reset Password' : meta.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {mode === 'forgot'
                  ? `Enter your registered email to receive reset instructions for ${meta.title}`
                  : meta.tagline}
              </p>
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl glass-emerald text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl glass-rose text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {savedRole === 'industry'
                  ? 'Corporate Work Email'
                  : savedRole === 'institution'
                  ? 'Official Admin Email'
                  : 'Institutional / College Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={meta.defaultEmail}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Fill Shortcut for Evaluators */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Evaluating SIH Solution?</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer glass-pill px-2.5 py-1 rounded-xl transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Fill Demo Credentials</span>
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'Authenticating...'
                  : mode === 'forgot'
                  ? 'Send Password Reset Link'
                  : `Sign In to ${savedRole === 'student' ? 'Student Portal' : savedRole === 'academician' ? 'Faculty Portal' : savedRole === 'industry' ? 'Recruiter Hub' : savedRole === 'institution' ? 'Admin Console' : 'Console'}`}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Back from Forgot Password */}
            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}
          </form>

          {/* Discreet Evaluator Role Switch Link */}
          <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500">
            <span>Evaluating SIH Solution? </span>
            <button
              type="button"
              onClick={onSwitchRole}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Switch Persona
            </button>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/60 glass-panel">
        Smart India Hackathon 2026 · Problem Statement SIH 26044 · Role-Isolated Secure Workspace
      </footer>
    </div>
  );
};
