import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Eye, EyeOff, AlertCircle, ArrowRight,
  GraduationCap, BookOpen, Building2, BarChart3, ShieldAlert, Zap,
  Search, Check, MapPin, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { DEMO_ROLES_CATALOG, careerConnectService } from '../../services/careerConnectService';
import { ALL_INDIA_COLLEGES, type CollegeRecord } from '../../data/collegeDatabase';
import type { UserRoleType, AuthUserSession } from '../../types/careerConnect';

interface Props {
  role: UserRoleType;
  initialMode: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AuthUserSession) => void;
}

export const RoleAuthModal: React.FC<Props> = ({
  role,
  initialMode,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Role specific fields
  const [selectedCollege, setSelectedCollege] = useState<CollegeRecord | null>(null);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('Government Engineering College, Modasa (GEC Modasa)');
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);

  const [department, setDepartment] = useState('Computer Engineering');
  const [currentSemester, setCurrentSemester] = useState<number>(6);
  const [cgpa, setCgpa] = useState('8.8');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [companyName, setCompanyName] = useState('Google AI Labs');
  const [sector, setSector] = useState('Healthcare AI & Informatics');

  const demoDef = DEMO_ROLES_CATALOG.find(d => d.role === role) || DEMO_ROLES_CATALOG[0];

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    if (initialMode === 'login') {
      setEmail(demoDef.email);
      setPassword('demo123456');
    }
  }, [role, initialMode]);

  // College filter logic
  const filteredColleges = useMemo(() => {
    if (!collegeSearchQuery.trim()) return ALL_INDIA_COLLEGES.slice(0, 8);
    const q = collegeSearchQuery.toLowerCase().trim();
    return ALL_INDIA_COLLEGES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [collegeSearchQuery]);

  // Department options based on selected college
  const departmentOptions = useMemo(() => {
    if (selectedCollege && selectedCollege.departments && selectedCollege.departments.length > 0) {
      return selectedCollege.departments;
    }
    return [
      'Computer Engineering',
      'Information Technology',
      'AI & Data Science',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Electronics & Communication'
    ];
  }, [selectedCollege]);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail(demoDef.email);
    setPassword('demo123456');
  };

  const handleSelectCollege = (col: CollegeRecord) => {
    setSelectedCollege(col);
    setCollegeSearchQuery(col.name);
    setIsCollegeDropdownOpen(false);
    if (col.departments && col.departments.length > 0) {
      setDepartment(col.departments[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Please enter your registered email address');
          return;
        }
        setSuccessMessage(`Password reset link has been dispatched to ${email.trim()} for ${roleTitleMap[role]}. Please check your inbox.`);
        return;
      }

      if (mode === 'login') {
        const session = await careerConnectService.loginWithRole(email, password, role);
        try {
          localStorage.setItem('novaresume_has_registered', 'true');
          localStorage.setItem('novaresume_saved_role', role);
          const userRoles = JSON.parse(localStorage.getItem('novaresume_user_roles') || '{}');
          userRoles[email.toLowerCase().trim()] = role;
          localStorage.setItem('novaresume_user_roles', JSON.stringify(userRoles));
        } catch {}
        onSuccess(session);
      } else {
        const session = await careerConnectService.registerWithRole({
          fullName,
          email,
          password,
          role,
          institutionName: collegeSearchQuery,
          department,
          cgpa,
          graduationYear: parseInt(graduationYear) || 2026,
          companyName,
          designation
        });
        // Enrich session with semester and college
        session.department = department;
        session.cgpa = cgpa;
        session.title = role === 'student' ? `B.Tech Sem ${currentSemester} • ${department}` : session.title;
        careerConnectService.setCurrentSession(session);
        try {
          localStorage.setItem('novaresume_has_registered', 'true');
          localStorage.setItem('novaresume_saved_role', role);
          const userRoles = JSON.parse(localStorage.getItem('novaresume_user_roles') || '{}');
          userRoles[email.toLowerCase().trim()] = role;
          localStorage.setItem('novaresume_user_roles', JSON.stringify(userRoles));
        } catch {}
        onSuccess(session);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleTitleMap: Record<string, string> = {
    student: 'Student Career Portal',
    academician: 'Faculty & Academician Portal',
    industry: 'Industry & Recruiter Hub',
    institution: 'Institution Administration Hub',
    super_admin: 'Super Admin Console'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-900 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Persona Pill */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
            {role === 'student' && <GraduationCap className="w-6 h-6 text-emerald-700" />}
            {role === 'academician' && <BookOpen className="w-6 h-6 text-purple-700" />}
            {role === 'industry' && <Building2 className="w-6 h-6 text-blue-700" />}
            {role === 'institution' && <BarChart3 className="w-6 h-6 text-amber-700" />}
            {role === 'super_admin' && <ShieldAlert className="w-6 h-6 text-rose-700" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{roleTitleMap[role]}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-50 border border-slate-200/90 text-slate-700 uppercase">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {mode === 'forgot' ? 'Reset your portal password' : mode === 'login' ? 'Sign in to access your verified dashboard' : 'Create an affiliated role account'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (Hidden for Super Admin and in Forgot Password mode) */}
        {role !== 'super_admin' && mode !== 'forgot' && (
          <div className="flex rounded-xl bg-slate-50 p-1 border border-slate-200/90 mb-5">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Ved Dhobi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'institution' ? 'Official Admin Email' : role === 'industry' ? 'Corporate Work Email' : 'Institutional / College Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === 'industry' ? 'recruiter@google.com' : 'student@novaconnect.edu'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Role-Specific Registration Fields */}
          {mode === 'register' && (
            <div className="space-y-3 pt-3 border-t border-slate-200/90">
              <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                {role === 'student' && 'Academic Credentials & Institution'}
                {role === 'academician' && 'Department & Academic Affiliation'}
                {role === 'industry' && 'Recruiter & Company Information'}
                {role === 'institution' && 'Institution Onboarding'}
              </div>

              {/* All-India College Searchable Autocomplete */}
              {(role === 'student' || role === 'academician' || role === 'institution') && (
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>College / Institute (All-India Database)</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">100+ Colleges Available</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={collegeSearchQuery}
                      onChange={e => {
                        setCollegeSearchQuery(e.target.value);
                        setIsCollegeDropdownOpen(true);
                      }}
                      onFocus={() => setIsCollegeDropdownOpen(true)}
                      placeholder="Type college name, code, or city (e.g. GEC Modasa, LDCE)..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isCollegeDropdownOpen && filteredColleges.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-200/90 rounded-xl shadow-xl py-1 divide-y divide-slate-100">
                      {filteredColleges.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleSelectCollege(col)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-start gap-2 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{col.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              Code: {col.code} • {col.city}, {col.state} • {col.university}
                            </div>
                          </div>
                          {selectedCollege?.id === col.id && (
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Department Selection */}
              {(role === 'student' || role === 'academician') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                  >
                    {departmentOptions.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student Semester, CGPA, and Batch */}
              {role === 'student' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Sem</label>
                    <select
                      value={currentSemester}
                      onChange={e => setCurrentSemester(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Sem {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CGPA</label>
                    <input
                      type="text"
                      value={cgpa}
                      onChange={e => setCgpa(e.target.value)}
                      placeholder="8.8"
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grad Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={e => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {role === 'academician' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Designation</label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                    <option value="Training & Placement Officer (TPO)">Training & Placement Officer (TPO)</option>
                  </select>
                </div>
              )}

              {role === 'industry' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Google AI Labs, TCS, Infosys"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={sector}
                      onChange={e => setSector(e.target.value)}
                      placeholder="e.g. Healthcare AI, Cloud Infrastructure, FinTech"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Fill Shortcut for Evaluators */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Evaluating SIH Solution?</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/90"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
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
            <span>{isLoading ? 'Authorizing...' : mode === 'forgot' ? 'Send Password Reset Link' : mode === 'login' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Back to Sign In Link if in Forgot Password Mode */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
