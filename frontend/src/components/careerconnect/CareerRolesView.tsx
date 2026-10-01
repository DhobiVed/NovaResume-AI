import React, { useState, useMemo } from 'react';
import {
  Briefcase, Target, CheckCircle2, AlertCircle,
  Sparkles, Layers, ArrowUpRight, Search, Check, ShieldCheck
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import type {
  StudentSkillItem, AuthUserSession,
  RoleSkillGapResult
} from '../../types/careerConnect';

interface CareerRolesViewProps {
  session: AuthUserSession | null;
  studentSkills: StudentSkillItem[];
  currentTargetRole?: string;
  onSetTargetRole: (roleTitle: string) => void;
  onNavigateToKnowledgeBase: (language: string, moduleId?: string, topicId?: string) => void;
  onStartSkillAssessment: (language: string) => void;
}

export const CareerRolesView: React.FC<CareerRolesViewProps> = ({
  session: _session,
  studentSkills,
  currentTargetRole,
  onSetTargetRole,
  onNavigateToKnowledgeBase,
  onStartSkillAssessment
}) => {
  const roles = useMemo(() => careerConnectService.getCareerRoles(), []);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    if (currentTargetRole) {
      const match = roles.find(r => r.title.toLowerCase() === currentTargetRole.toLowerCase());
      if (match) return match.id;
    }
    return roles[0].id;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ['All', 'Development', 'Data & AI', 'Cloud & DevOps', 'Security & Systems', 'Quality'];
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
      const matchQ = !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recommendedLanguages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQ;
    });
  }, [roles, selectedCategory, searchQuery]);

  const activeRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Real-time Skill Gap calculation comparing student's actual skills to active role
  const skillGapResult = useMemo<RoleSkillGapResult>(() => {
    return careerConnectService.calculateRoleSkillGap(studentSkills, activeRole.id);
  }, [studentSkills, activeRole.id]);

  const isCurrentTarget = currentTargetRole?.toLowerCase() === activeRole.title.toLowerCase();

  const handleSelectTarget = (roleTitle: string) => {
    onSetTargetRole(roleTitle);
    setStatusToast(`"${roleTitle}" set as your target career role!`);
    setTimeout(() => setStatusToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slideIn">
          <Sparkles className="w-4 h-4 text-[#6366F1]" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-black border border-slate-200/90">
                CAREER ROLE INTELLIGENCE
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Industry Skill Mapping & Roadmaps
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Technology Career Paths & Skill Gap Analysis
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-2xl mt-0.5">
              Explore prerequisite matrices for high-impact software roles, benchmark your verified scores against production engineering criteria, and bridge competency gaps.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search roles or skills..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-200/80">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── ROLES LIST (LEFT) ── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs space-y-2 lg:sticky lg:top-4">
          <div className="px-2 py-1 text-xs font-black text-slate-500 uppercase tracking-wider">
            Available Career Roles ({filteredRoles.length})
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredRoles.map(r => {
              const isSelected = r.id === activeRole.id;
              const isTarget = currentTargetRole?.toLowerCase() === r.title.toLowerCase();

              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-indigo-50 border-amber-600 shadow-xs'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-900 truncate">{r.title}</span>
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300 flex-shrink-0">
                        Target ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{r.shortDescription}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ROLE DETAIL & SKILL GAP (RIGHT) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Role Header & Target Role CTA */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 text-[10px] font-bold border border-slate-200/90">
                  {activeRole.category}
                </span>
                {isCurrentTarget && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                    Your Current Target Role
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">{activeRole.title}</h2>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {activeRole.overview}
              </p>
            </div>

            <button
              onClick={() => handleSelectTarget(activeRole.title)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs flex-shrink-0 ${
                isCurrentTarget
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-200/90'
              }`}
            >
              {isCurrentTarget ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Target Selected</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Set as My Target Role</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Student Skill Gap Analysis Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h3 className="text-sm font-black text-slate-900">
                    Your Skill Gap Analysis for {activeRole.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Calculated from your real verified assessment scores and internal profile skills.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {skillGapResult.readinessPercentage}%
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Role Readiness</div>
              </div>
            </div>

            {/* Skill Tiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Strong Skills */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strong Competencies ({skillGapResult.strongSkills.length})</span>
                </div>
                {skillGapResult.strongSkills.length === 0 ? (
                  <p className="text-[11px] text-slate-400">None assessed at 80%+ yet.</p>
                ) : (
                  <div className="space-y-1">
                    {skillGapResult.strongSkills.map(s => (
                      <div key={s.skill} className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                        <span>{s.skill}</span>
                        <span className="font-mono">{s.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Needs Improvement */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="font-black text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Needs Practice ({skillGapResult.needsImprovementSkills.length + skillGapResult.moderateSkills.length})</span>
                </div>
                {skillGapResult.needsImprovementSkills.length === 0 && skillGapResult.moderateSkills.length === 0 ? (
                  <p className="text-[11px] text-slate-400">None in this tier.</p>
                ) : (
                  <div className="space-y-1">
                    {[...skillGapResult.moderateSkills, ...skillGapResult.needsImprovementSkills].map(s => (
                      <div key={s.skill} className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                        <span>{s.skill}</span>
                        <span className="font-mono">{s.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="font-black text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Missing Prerequisite ({skillGapResult.missingSkills.length})</span>
                </div>
                {skillGapResult.missingSkills.length === 0 ? (
                  <p className="text-[11px] text-slate-400">All prerequisites registered.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {skillGapResult.missingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white text-rose-700 text-[10px] font-bold border border-rose-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Targeted Recommendations */}
            {skillGapResult.recommendations.length > 0 && (
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <span className="text-xs font-black text-slate-900">Personalized Learning Directives:</span>
                <div className="space-y-2">
                  {skillGapResult.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{rec.skill}: </span>
                        <span className="text-slate-600">{rec.action}</span>
                      </div>
                      <button
                        onClick={() => onNavigateToKnowledgeBase(rec.skill)}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-2xs"
                      >
                        <span>Learn Topic</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4-Stage Career Roadmap */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>4-Stage Engineering Career Roadmap</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Basic */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">1. Foundational Basics</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Level 1</span>
                </div>
                <ul className="space-y-1.5 text-slate-600">
                  {activeRole.basicRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Intermediate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">2. Intermediate Core</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Level 2</span>
                </div>
                <ul className="space-y-1.5 text-slate-600">
                  {activeRole.intermediateRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advanced */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">3. Advanced Systems</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Level 3</span>
                </div>
                <ul className="space-y-1.5 text-slate-600">
                  {activeRole.advancedRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Industry Ready */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">4. Industry-Ready Production</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Level 4</span>
                </div>
                <ul className="space-y-1.5 text-slate-600">
                  {activeRole.industryReadyRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Common Industry Tech Stack Combinations */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-700" />
              <span>Common Industry Tech Stack Combinations</span>
            </h3>
            <div className="space-y-2.5">
              {activeRole.commonCombinations.map((combo, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-black text-slate-900 font-mono text-[11px] mb-1">
                    {combo.combo}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{combo.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 font-medium">
              Want to test your proficiency in {activeRole.recommendedLanguages[0]}?
            </div>
            <button
              onClick={() => onStartSkillAssessment(activeRole.recommendedLanguages[0])}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch {activeRole.recommendedLanguages[0]} 50-Q Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
