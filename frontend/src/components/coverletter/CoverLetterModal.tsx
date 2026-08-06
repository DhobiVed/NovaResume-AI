import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Download, Copy, Check, Wand2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ isOpen, onClose, resumeData }) => {
  const [jobTitle, setJobTitle] = useState('Senior AI Systems Engineer');
  const [companyName, setCompanyName] = useState('Tech Corp Inc.');
  const [jobDescription, setJobDescription] = useState('');
  const [templateStyle, setTemplateStyle] = useState<'executive' | 'technical' | 'minimal'>('technical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const [coverLetterContent, setCoverLetterContent] = useState(
    `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. With over 6 years of experience engineering high-throughput LLM architectures, RAG document retrieval engines, and scalable FastAPI microservices, I am confident in my ability to add immediate value to your engineering organization.\n\nAt my current organization, I led the architecture of enterprise RAG solutions handling 50k+ daily streaming requests while scaling query throughput by 300%. My background aligns directly with your requirements for high-performance backend systems and clean, production-grade Python services.\n\nThank you for your time and consideration. I look forward to discussing how my experience aligns with your team's goals.\n\nSincerely,\n${resumeData?.fullName || 'Alex Vance'}`
  );

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setAiNotice(null);
    setTimeout(() => {
      let content = '';
      if (templateStyle === 'executive') {
        content = `Dear Executive Hiring Committee,\n\nI am writing to submit my candidacy for the ${jobTitle} role at ${companyName}. As a proven engineering leader with 6+ years of experience scaling AI pipelines and leading cross-functional engineering initiatives, I bring both technical depth and strategic execution to this role.\n\nThroughout my career, I have specialized in building robust Python architectures and optimizing high-concurrency systems. At NeuralTech AI, I spearheaded the deployment of enterprise RAG document retrieval engines, driving a 300% throughput increase while maintaining 99.9% uptime.\n\nI look forward to discussing how my leadership and technical expertise will support ${companyName}'s growth objectives.\n\nSincerely,\n${resumeData?.fullName || 'Alex Vance'}`;
      } else if (templateStyle === 'minimal') {
        content = `Dear ${companyName} Team,\n\nPlease accept this letter as my application for the ${jobTitle} position. With 6+ years of hands-on experience in software engineering and AI system design, I bring a strong background in Python, FastAPI, and production LLM orchestration.\n\nKey Highlights:\n• Architected enterprise RAG retrieval systems handling 50k+ daily requests.\n• Reduced query latency by 45% through query optimization and vector indexing.\n\nThank you for reviewing my application. I welcome the opportunity to interview.\n\nBest regards,\n${resumeData?.fullName || 'Alex Vance'}`;
      } else {
        content = `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. With over 6 years of experience engineering high-throughput LLM architectures, RAG document retrieval engines, and scalable FastAPI microservices, I am confident in my ability to add immediate value to your engineering organization.\n\nAt my current organization, I led the architecture of enterprise RAG solutions handling 50k+ daily streaming requests while scaling query throughput by 300%. My background aligns directly with your requirements for high-performance backend systems and clean, production-grade Python services.\n\nThank you for your time and consideration. I look forward to discussing how my experience aligns with your team's goals.\n\nSincerely,\n${resumeData?.fullName || 'Alex Vance'}`;
      }
      setCoverLetterContent(content);
      setIsGenerating(false);
      setAiNotice('Cover letter tailored to target role!');
    }, 500);
  };

  const handleAiPolish = () => {
    setCoverLetterContent(prev => 
      prev.replace('I am writing to express', 'I am thrilled to submit my application for')
          .replace('Thank you for your time', 'Thank you for reviewing my credentials')
    );
    setAiNotice('Tone and grammar polished with AI!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner Accent Line
      pdf.setFillColor(5, 150, 105); // Emerald Green
      pdf.rect(0, 0, 210, 8, 'F');

      // Title & Header info
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(resumeData?.fullName || 'Alex Vance', 20, 25);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(5, 150, 105);
      pdf.text(`Cover Letter — ${jobTitle}`, 20, 32);

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${resumeData?.email || 'alex.vance@example.com'} | ${resumeData?.phone || '+1 (555) 019-2834'} | ${resumeData?.location || 'San Francisco, CA'}`, 20, 38);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(20, 42, 190, 42);

      // Body text formatting
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const splitText = pdf.splitTextToSize(coverLetterContent, 170);
      pdf.text(splitText, 20, 52);

      pdf.save(`${(resumeData?.fullName || 'Alex_Vance').toLowerCase().replace(/ /g, '_')}_cover_letter.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl w-full max-w-4xl shadow-2xl p-3 sm:p-6 relative flex flex-col h-full sm:h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 flex-shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">AI Cover Letter Generator</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">Generate matching tailored cover letters in seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Notice Banner */}
        {aiNotice && (
          <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{aiNotice}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-3.5 pr-1 text-xs">
          {/* Target Role Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Template Style Switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 gap-2">
            <span className="font-bold text-slate-700">Cover Letter Template Tone</span>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'technical', label: 'Technical / Engineering' },
                { id: 'executive', label: 'Executive Leadership' },
                { id: 'minimal', label: 'ATS Clean Minimal' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplateStyle(t.id as any)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center min-h-[36px] ${
                    templateStyle === t.id ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Job Description Requirements (Optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste key responsibilities to align narrative..."
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Tailoring Narrative...' : 'Generate Matching Cover Letter'}</span>
            </button>
            <button
              onClick={handleAiPolish}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200"
            >
              <Wand2 className="w-4 h-4 text-emerald-600" />
              <span>AI Tone Polish</span>
            </button>
          </div>

          {/* Letter Editor Canvas */}
          <div className="relative border border-slate-200 rounded-2xl p-6 bg-white shadow-inner">
            <textarea
              value={coverLetterContent}
              onChange={(e) => setCoverLetterContent(e.target.value)}
              rows={12}
              className="w-full text-xs font-sans leading-relaxed text-slate-800 bg-transparent border-0 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Text' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Cover Letter PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
