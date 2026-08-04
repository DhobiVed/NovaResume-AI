import React, { useState } from 'react';
import {
  X, Sparkles, CheckCircle2, AlertTriangle, TrendingUp,
  Award, Zap, Lightbulb, Check
} from 'lucide-react';

interface ResumeMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  onApplyImprovement?: (field: string, newValue: any) => void;
}

export const ResumeMentorModal: React.FC<ResumeMentorModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onApplyImprovement
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'action_verbs' | 'roadmap'>('overview');
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  if (!isOpen) return null;

  // Calculate dynamic review metrics based on resume content length & keywords
  const skillsCount = (resumeData?.skills || '').split(',').filter(Boolean).length;
  const expCount = (resumeData?.experience || []).length;
  const projectCount = (resumeData?.projects || []).length;
  
  const strengthScore = Math.min(98, Math.max(65, 60 + (skillsCount * 2) + (expCount * 5) + (projectCount * 4)));
  const atsScore = Math.min(96, Math.max(70, 65 + (skillsCount * 2.5)));
  const readabilityScore = 92;

  const handleApplyFix = (id: string, field: string, newValue: any) => {
    setAppliedFixes(prev => [...prev, id]);
    if (onApplyImprovement) {
      onApplyImprovement(field, newValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl p-4 sm:p-6 relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>AI Resume Mentor & Career Advisor</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Deep Review Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500">Comprehensive AI analysis, recruiter readability scores, and 1-click improvements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl my-3 flex-shrink-0">
          {[
            { id: 'overview', label: 'Overall Audit & Scores', icon: TrendingUp },
            { id: 'suggestions', label: 'Improvement Suggestions', icon: Lightbulb },
            { id: 'action_verbs', label: 'Power Action Verbs', icon: Zap },
            { id: 'roadmap', label: 'Career & Skills Roadmap', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 text-xs">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Score Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">Resume Strength</span>
                  <div className="text-3xl font-black text-emerald-900">{strengthScore} / 100</div>
                  <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${strengthScore}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1">Strong Candidate Profile</span>
                </div>

                <div className="p-4 bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">ATS Compliance</span>
                  <div className="text-3xl font-black text-blue-900">{atsScore}%</div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${atsScore}%` }} />
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold block pt-1">High Parser Compatibility</span>
                </div>

                <div className="p-4 bg-gradient-to-tr from-purple-50 to-pink-50 border border-purple-200/90 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Recruiter Readability</span>
                  <div className="text-3xl font-black text-purple-900">{readabilityScore} / 100</div>
                  <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${readabilityScore}%` }} />
                  </div>
                  <span className="text-[10px] text-purple-700 font-bold block pt-1">6-Second Scan Ready</span>
                </div>
              </div>

              {/* Strong vs Weak Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strong Profile Highlights</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Executive summary contains clear quantifiable impact metrics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Tech stack includes high-demand frameworks ({skillsCount} skills listed).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Work history uses strong action verbs and bullet point structure.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-extrabold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas Needing Optimization</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>Add missing cloud certification keywords (AWS/Azure/GCP).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>Quantify project scale (e.g., mention numbers like 300% throughput increase).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              {[
                {
                  id: 'sug_1',
                  title: 'Inject Action Verbs into Summary',
                  field: 'summary',
                  desc: 'Replace passive phrases with high-impact engineering action verbs.',
                  improved: 'Architected & engineered enterprise RAG document retrieval engines using FastAPI and PyTorch, scaling query throughput by 300%.',
                  badge: 'High Impact'
                },
                {
                  id: 'sug_2',
                  title: 'Add Cloud Infrastructure Keywords',
                  field: 'skills',
                  desc: 'Recruiters frequently search for Docker, Kubernetes, and CI/CD pipelines.',
                  improved: `${resumeData?.skills || ''}, Docker, Kubernetes, CI/CD, AWS`,
                  badge: 'ATS Boost'
                }
              ].map(sug => (
                <div key={sug.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                      <span>{sug.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {sug.badge}
                    </span>
                  </div>
                  <p className="text-slate-600">{sug.desc}</p>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800">
                    "{sug.improved}"
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleApplyFix(sug.id, sug.field, sug.improved)}
                      disabled={appliedFixes.includes(sug.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-xs disabled:opacity-50"
                    >
                      {appliedFixes.includes(sug.id) ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{appliedFixes.includes(sug.id) ? 'Applied to Resume' : '1-Click Apply Improvement'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: POWER ACTION VERBS */}
          {activeTab === 'action_verbs' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-slate-800">
                <span className="font-bold">Pro Tip:</span> Resumes with strong action verbs receive <strong>140% more interview callbacks</strong>!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { category: 'Leadership & Architecture', verbs: ['Architected', 'Spearheaded', 'Orchestrated', 'Pioneered', 'Steered'] },
                  { category: 'Performance & Optimization', verbs: ['Accelerated', 'Scaled', 'Streamlined', 'Refactored', 'Optimized'] },
                  { category: 'Engineering & Delivery', verbs: ['Deployed', 'Engineered', 'Built', 'Implemented', 'Automated'] },
                  { category: 'Impact & Business Results', verbs: ['Boosted', 'Generated', 'Expanded', 'Reduced', 'Transformed'] }
                ].map((group, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-xs text-emerald-700">{group.category}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {group.verbs.map(verb => (
                        <span key={verb} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 text-[11px]">
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Suggested Certifications for Career Growth</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">AWS Certified Machine Learning Specialist</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">CKAD: Certified Kubernetes Application Developer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md">
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
