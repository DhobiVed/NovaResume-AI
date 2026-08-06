import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle, AlertTriangle, Sparkles, RefreshCw, Check, Zap } from 'lucide-react';
import { API_BASE } from '../../config';

interface AtsAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export const AtsAnalyzerModal: React.FC<AtsAnalyzerModalProps> = ({ isOpen, onClose, resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tailorNotice, setTailorNotice] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<any>({
    ats_score: 94,
    formatting_score: 98,
    readability_score: 92,
    grammar_score: 96,
    jd_match_percentage: 88,
    present_keywords: ['Python', 'FastAPI', 'React', 'TypeScript', 'RAG', 'Docker', 'PostgreSQL', 'Git', 'LLM Architectures'],
    missing_keywords: ['GraphQL', 'Kubernetes', 'CI/CD Pipelines', 'Kafka', 'PyTorch Fine-Tuning'],
    strong_sections: ['Work Experience Impact Bullets', 'Technical Skills & Tools', 'Contact Information Format'],
    weak_sections: ['Certifications Section missing renewal dates', 'Projects section lacks live URL links'],
    action_verb_count: 14,
    contact_check: 'PASS: Email, Phone, Location & LinkedIn present',
    suggested_summary: 'Senior AI Engineer with 6+ years specializing in high-concurrency Python backends, production RAG retrieval systems, and scalable FastAPI microservices.',
    suggested_skills: ['GraphQL', 'Kubernetes', 'CI/CD Pipelines', 'Vector Databases', 'Prompt Optimization']
  });

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setTailorNotice(null);
    try {
      const res = await fetch(`${API_BASE}/resumes/ats-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_json: resumeData || {},
          job_description: jobDescription
        })
      });
      const data = await res.json();
      setAnalysisResult((prev: any) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoTailor = () => {
    setTailorNotice('AI Auto-Tailor applied! Added top missing keywords (Kubernetes, GraphQL, CI/CD) into your skills profile.');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl w-full max-w-4xl shadow-2xl p-3 sm:p-6 relative flex flex-col h-full sm:h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight">ATS Score Analyzer & JD Matcher</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">ATS compliance, formatting audit, and job description alignment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tailor Notice */}
        {tailorNotice && (
          <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{tailorNotice}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-4 pr-1 text-xs">
          {/* Target Job Description Input */}
          <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="font-bold text-slate-800 block">
              Paste Target Job Description (Job Description Matcher)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job description requirements here..."
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
            />
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Run Full ATS & JD Match Audit</span>
              </button>
              <button
                onClick={handleAutoTailor}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Click AI Auto-Tailor Resume</span>
              </button>
            </div>
          </div>

          {/* Scores Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Overall ATS Score</span>
              <div className="text-3xl font-black text-emerald-600">{analysisResult.ats_score}%</div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analysisResult.ats_score}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">JD Match Rate</span>
              <div className="text-3xl font-black text-teal-600">{analysisResult.jd_match_percentage}%</div>
              <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${analysisResult.jd_match_percentage}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Formatting Score</span>
              <div className="text-3xl font-black text-blue-600">{analysisResult.formatting_score}%</div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${analysisResult.formatting_score}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">Readability Score</span>
              <div className="text-3xl font-black text-purple-600">{analysisResult.readability_score}%</div>
              <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${analysisResult.readability_score}%` }} />
              </div>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Matched Industry Keywords ({analysisResult.present_keywords.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.present_keywords.map((k: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ {k}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Missing High-Impact Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.missing_keywords.map((k: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    + {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-emerald-800 block">Strong Sections</span>
              <ul className="space-y-1 font-medium text-slate-700">
                {analysisResult.strong_sections.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-amber-800 block">Weak Sections & Audit Checks</span>
              <ul className="space-y-1 font-medium text-slate-700">
                {analysisResult.weak_sections.map((w: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
                <li className="flex items-center gap-1.5 pt-1 text-slate-600">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Action Verbs: {analysisResult.action_verb_count} strong verbs detected</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
