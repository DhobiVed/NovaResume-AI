import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  X, FileText, Download, Sparkles,
  Check, Palette, Type, Layout,
  Plus, Trash2, AlignLeft, AlignCenter, AlignRight, FileCode
} from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_THEMES = [
  { id: 'royal_blue', name: 'Royal Blue + White', bg: '#1e3a8a', accent: '#3b82f6', cardBg: '#f8fafc', text: '#0f172a' },
  { id: 'navy_gold', name: 'Navy + Gold', bg: '#0f172a', accent: '#eab308', cardBg: '#f8fafc', text: '#0f172a' },
  { id: 'black_emerald', name: 'Black + Emerald', bg: '#064e3b', accent: '#10b981', cardBg: '#f0fdf4', text: '#064e3b' },
  { id: 'indigo_cyan', name: 'Indigo + Cyan', bg: '#312e81', accent: '#06b6d4', cardBg: '#f0f9ff', text: '#1e1b4b' },
  { id: 'slate_orange', name: 'Slate + Orange', bg: '#1e293b', accent: '#f97316', cardBg: '#fff7ed', text: '#0f172a' },
  { id: 'wine_grey', name: 'Wine + Grey', bg: '#4c1d95', accent: '#a855f7', cardBg: '#faf5ff', text: '#3b0764' },
  { id: 'dark_purple', name: 'Dark Purple + Silver', bg: '#3b0764', accent: '#d8b4fe', cardBg: '#f3e8ff', text: '#2e1065' },
  { id: 'charcoal_blue', name: 'Charcoal + Blue', bg: '#111827', accent: '#38bdf8', cardBg: '#f0f9ff', text: '#111827' },
  { id: 'forest_green', name: 'Forest Green', bg: '#14532d', accent: '#22c55e', cardBg: '#f0fdf4', text: '#14532d' },
  { id: 'cyberpunk_dark', name: 'Cyberpunk Dark', bg: '#09090b', accent: '#f43f5e', cardBg: '#18181b', text: '#f4f4f5' },
  { id: 'google_style', name: 'Google Designer', bg: '#1a73e8', accent: '#ea4335', cardBg: '#f8f9fa', text: '#202124' },
  { id: 'canva_modern', name: 'Canva Studio', bg: '#7d2ae8', accent: '#00c4cc', cardBg: '#fafafa', text: '#2d3748' },
];

const FONT_FAMILIES = ['sans-serif', 'serif', 'monospace', 'Inter', 'Roboto', 'Outfit', 'Poppins', 'Merriweather'];

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  // Navigation Tabs for Editor Controls
  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'colors' | 'layout' | 'ai'>('content');
  const [contentSection, setContentSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'custom'>('personal');

  // Customization & Style Settings
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState<number>(12);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right' | 'top'>('left');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [photoShape, setPhotoShape] = useState<'round' | 'square'>('round');

  // Colors
  const [headerBg, setHeaderBg] = useState('#1e3a8a');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [cardBgColor, setCardBgColor] = useState('#f8fafc');
  const [textColor, setTextColor] = useState('#0f172a');

  // AI & Export State
  const [isImproving, setIsImproving] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Resume Data Content
  const [personal, setPersonal] = useState({
    fullName: 'Alex Vance',
    title: 'Senior AI Systems Engineer',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    github: 'github.com/alexvance',
    objective: 'To lead innovative AI engineering teams in developing high-throughput LLM architectures and production RAG retrieval platforms.',
    summary: 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.'
  });

  const [experience, setExperience] = useState([
    {
      company: 'NeuralTech AI',
      role: 'Lead AI Engineer',
      dates: '2022 - Present',
      bullets: 'Architected enterprise RAG document retrieval engines using FAISS & Groq API, scaling query throughput by 300%.\nEngineered async FastAPI microservices handling 50k+ daily streaming requests.'
    },
    {
      company: 'DataFlow Systems',
      role: 'Software Engineer',
      dates: '2019 - 2022',
      bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.\nOptimized SQL queries reducing analytics latency by 45%.'
    }
  ]);

  const [education, setEducation] = useState([
    {
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      year: '2019'
    }
  ]);

  const [skills, setSkills] = useState('Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, Tailwind CSS, PostgreSQL, Docker, Git');

  const [projects, setProjects] = useState([
    {
      name: 'NovaChat AI Platform',
      description: 'Production AI Platform with real-time SSE token streaming, multi-format file RAG Q&A, and single-page PDF generator.'
    }
  ]);

  const [additional, setAdditional] = useState({
    certifications: 'AWS Certified Machine Learning Specialist, TensorFlow Developer Certificate',
    languages: 'English (Native), Spanish (Professional), Japanese (Conversational)',
    achievements: 'Winner of Global AI Innovation Hackathon (1st place out of 400 teams)\nPublished research paper on Context Window Compression in LLMs'
  });

  const [customSections, setCustomSections] = useState([
    { title: 'Research & Publications', content: 'Co-authored paper: "Optimizing Context Retrieval Overhead in High-Concurrency Agentic Workflows" (2025)' }
  ]);

  if (!isOpen) return null;

  const handleApplyPresetTheme = (theme: typeof PRESET_THEMES[0]) => {
    setHeaderBg(theme.bg);
    setAccentColor(theme.accent);
    setCardBgColor(theme.cardBg);
    setTextColor(theme.text);
  };

  const handleAiImprove = (actionType: string) => {
    setIsImproving(true);
    setAiNotice(null);

    setTimeout(() => {
      if (actionType === 'summary') {
        setPersonal((prev) => ({
          ...prev,
          summary: 'High-impact Senior AI Engineer specializing in LLM production orchestration, RAG retrieval architectures, and scalable async Python microservices with a track record of boosting system performance.'
        }));
        setAiNotice('Executive Summary enhanced for ATS readability & executive impact!');
      } else if (actionType === 'ats') {
        setSkills((prev) => `${prev}, Vector Databases, RAG Pipeline Optimization, Prompt Engineering, Microservices Architecture`);
        setAiNotice('ATS keywords optimized!');
      } else if (actionType === 'achievements') {
        setAdditional((prev) => ({
          ...prev,
          achievements: '🥇 1st Place Winner: Global AI Innovation Hackathon (out of 400+ international engineering teams)\n📜 Authored high-impact research paper on Context Window Compression in Large Language Models'
        }));
        setAiNotice('Achievements rewritten with strong metrics!');
      }
      setIsImproving(false);
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleExportPdf = async () => {
    const fullResumeData = {
      fullName: personal.fullName,
      title: personal.title,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      linkedin: personal.linkedin,
      github: personal.github,
      objective: personal.objective,
      summary: personal.summary,
      skills: skills,
      certifications: additional.certifications,
      languages: additional.languages,
      achievements: additional.achievements,
      experience,
      education,
      projects
    };

    await api.generateGraphicResume(fullResumeData, 'royal_blue');
    onClose();
  };

  const handleExportDocx = async () => {
    const textContent = `
${personal.fullName.toUpperCase()}
${personal.title}
${personal.email} | ${personal.phone} | ${personal.location}

OBJECTIVE
${personal.objective}

SUMMARY
${personal.summary}

EXPERIENCE
${experience.map(e => `${e.role} - ${e.company} (${e.dates})\n${e.bullets}`).join('\n\n')}

SKILLS
${skills}

EDUCATION
${education.map(ed => `${ed.degree} - ${ed.school} (${ed.year})`).join('\n')}

PROJECTS
${projects.map(p => `${p.name}: ${p.description}`).join('\n')}
    `.trim();

    await api.generateDocument(`${personal.fullName} - Resume`, 'resume', 'docx', textContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl p-4 md:p-6 relative flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Canva Resume Studio & Live Customizer</h2>
              <p className="text-xs text-slate-400">Full Design Control: Typography, Palette, Layout, Sections & AI Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Banner */}
        {aiNotice && (
          <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{aiNotice}</span>
          </div>
        )}

        {/* Main Editor Split Area: Controls (Left) vs Live Graphic Canvas (Right) */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden mt-3">
          {/* LEFT: Controls Panel */}
          <div className="w-full md:w-1/2 flex flex-col min-h-0 border-r border-slate-200/80 dark:border-slate-800/80 pr-3">
            {/* Top Control Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3">
              {[
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'design', label: 'Fonts & Style', icon: Type },
                { id: 'colors', label: 'Palette & Theme', icon: Palette },
                { id: 'layout', label: 'Layout', icon: Layout },
                { id: 'ai', label: 'AI Writer', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEditorTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      editorTab === tab.id
                        ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: Content Editor */}
            {editorTab === 'content' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {/* Content Sub-Navigation */}
                <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {[
                    { id: 'personal', label: 'Personal' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'education', label: 'Education' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'custom', label: 'Custom' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setContentSection(sub.id as any)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        contentSection === sub.id
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {contentSection === 'personal' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">Full Name</label>
                        <input
                          type="text"
                          value={personal.fullName}
                          onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                          className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">Job Title</label>
                        <input
                          type="text"
                          value={personal.title}
                          onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                          className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">Email</label>
                        <input
                          type="email"
                          value={personal.email}
                          onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                          className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">Phone</label>
                        <input
                          type="text"
                          value={personal.phone}
                          onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                          className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">Location</label>
                      <input
                        type="text"
                        value={personal.location}
                        onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                        className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">Executive Summary</label>
                      <textarea
                        value={personal.summary}
                        onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                        rows={3}
                        className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                )}

                {contentSection === 'experience' && (
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Experience #{idx + 1}</span>
                          <button
                            onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx].company = e.target.value;
                              setExperience(updated);
                            }}
                            placeholder="Company"
                            className="p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          />
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx].role = e.target.value;
                              setExperience(updated);
                            }}
                            placeholder="Role"
                            className="p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          />
                        </div>
                        <textarea
                          value={exp.bullets}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].bullets = e.target.value;
                            setExperience(updated);
                          }}
                          rows={3}
                          placeholder="Accomplishments..."
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setExperience([...experience, { company: 'New Tech Corp', role: 'Engineer', dates: '2024 - Present', bullets: 'Key accomplishment...' }])}
                      className="w-full py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-primary flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Experience Position
                    </button>
                  </div>
                )}

                {contentSection === 'education' && (
                  <div className="space-y-3">
                    {education.map((ed, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <input
                          type="text"
                          value={ed.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="Degree"
                          className="w-full p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ed.school}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx].school = e.target.value;
                              setEducation(updated);
                            }}
                            placeholder="School"
                            className="p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border"
                          />
                          <input
                            type="text"
                            value={ed.year}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx].year = e.target.value;
                              setEducation(updated);
                            }}
                            placeholder="Graduation Year"
                            className="p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contentSection === 'projects' && (
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].name = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Project Name"
                          className="w-full p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border font-bold"
                        />
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].description = e.target.value;
                            setProjects(updated);
                          }}
                          rows={2}
                          placeholder="Project Details..."
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {contentSection === 'skills' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Skills (Comma-separated)</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows={5}
                      className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                )}

                {contentSection === 'custom' && (
                  <div className="space-y-3">
                    {customSections.map((sec, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...customSections];
                            updated[idx].title = e.target.value;
                            setCustomSections(updated);
                          }}
                          placeholder="Section Title"
                          className="w-full p-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border font-bold"
                        />
                        <textarea
                          value={sec.content}
                          onChange={(e) => {
                            const updated = [...customSections];
                            updated[idx].content = e.target.value;
                            setCustomSections(updated);
                          }}
                          rows={2}
                          placeholder="Section Content..."
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setCustomSections([...customSections, { title: 'New Custom Section', content: 'Add custom text details...' }])}
                      className="w-full py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-primary flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Section
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Fonts & Typography */}
            {editorTab === 'design' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Font Size ({fontSize}px)</label>
                  <input
                    type="range"
                    min="9"
                    max="16"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Text Alignment</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'left', icon: AlignLeft },
                      { id: 'center', icon: AlignCenter },
                      { id: 'right', icon: AlignRight }
                    ].map((al) => {
                      const Icon = al.icon;
                      return (
                        <button
                          key={al.id}
                          onClick={() => setTextAlign(al.id as any)}
                          className={`flex-1 p-2 rounded-xl border flex items-center justify-center ${
                            textAlign === al.id ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Media Controls */}
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Profile Photo</span>
                    <input
                      type="checkbox"
                      checked={showPhoto}
                      onChange={(e) => setShowPhoto(e.target.checked)}
                      className="accent-primary"
                    />
                  </div>
                  {showPhoto && (
                    <>
                      <div className="flex items-center gap-2">
                        <img src={photoUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border" />
                        <label className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer">
                          Upload Photo
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setPhotoShape('round')}
                          className={`flex-1 py-1 text-xs rounded-lg font-bold border ${photoShape === 'round' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900'}`}
                        >
                          Round Avatar
                        </button>
                        <button
                          onClick={() => setPhotoShape('square')}
                          className={`flex-1 py-1 text-xs rounded-lg font-bold border ${photoShape === 'square' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900'}`}
                        >
                          Square Avatar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Colors & Preset Themes */}
            {editorTab === 'colors' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Preset Designer Themes</span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => handleApplyPresetTheme(th)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-[11px] font-bold flex items-center justify-between hover:scale-[1.02] transition-transform"
                        style={{ backgroundColor: th.cardBg }}
                      >
                        <span style={{ color: th.text }}>{th.name}</span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.bg }}></span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Custom Color Picker</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Header / Sidebar BG</label>
                      <input
                        type="color"
                        value={headerBg}
                        onChange={(e) => setHeaderBg(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Accent Accent Color</label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: Layout */}
            {editorTab === 'layout' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Sidebar Layout Position</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'Left Sidebar' },
                    { id: 'right', label: 'Right Sidebar' },
                    { id: 'top', label: 'Top Banner Only' }
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setSidebarPosition(pos.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center ${
                        sidebarPosition === pos.id ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: AI Assistance */}
            {editorTab === 'ai' && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 space-y-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> 1-Click AI Resume Optimizer
                  </span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAiImprove('summary')}
                      disabled={isImproving}
                      className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow text-left"
                    >
                      ✨ Rewrite Executive Summary for Executive Impact
                    </button>
                    <button
                      onClick={() => handleAiImprove('ats')}
                      disabled={isImproving}
                      className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow text-left"
                    >
                      🎯 Add Top Recommended ATS Keywords
                    </button>
                    <button
                      onClick={() => handleAiImprove('achievements')}
                      disabled={isImproving}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow text-left"
                    >
                      📝 Quantify & Enhance Achievements
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Canva-Style Graphic Preview Canvas */}
          <div className="w-full md:w-1/2 flex flex-col min-h-0 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-2 bg-slate-200 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>LIVE CANVA PREVIEW CANVAS</span>
              <span>100% VECTOR ATS READY</span>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 font-sans text-xs select-none"
              style={{ fontFamily, fontSize: `${fontSize}px`, textAlign, color: textColor }}
            >
              {/* Graphic Banner */}
              <div
                className="p-4 text-white rounded-2xl shadow-md mb-3 flex items-center justify-between"
                style={{ backgroundColor: headerBg }}
              >
                <div>
                  <div className="font-extrabold text-xl tracking-tight">{personal.fullName || 'Your Name'}</div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    {personal.title}
                  </div>
                  <div className="text-[10px] opacity-80 pt-1 flex flex-wrap gap-2">
                    <span>📧 {personal.email}</span>
                    <span>📞 {personal.phone}</span>
                  </div>
                </div>
                {showPhoto && photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className={`w-14 h-14 object-cover border-2 border-white shadow-md ${
                      photoShape === 'round' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  />
                )}
              </div>

              {/* Graphic 2-Column Canvas Layout */}
              <div className={`flex gap-3 ${sidebarPosition === 'right' ? 'flex-row-reverse' : sidebarPosition === 'top' ? 'flex-col' : 'flex-row'}`}>
                {/* Sidebar Column */}
                <div
                  className="w-1/3 p-3 rounded-2xl text-white space-y-3 shadow-inner"
                  style={{ backgroundColor: headerBg }}
                >
                  {skills && (
                    <div>
                      <div className="font-bold border-b border-white/20 pb-0.5 mb-1 uppercase text-[9px] tracking-wider" style={{ color: accentColor }}>
                        Skills & Tools
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skills.split(',').slice(0, 8).map((s, idx) => (
                          <span key={idx} className="bg-white/15 px-1.5 py-0.5 rounded text-[8px] font-semibold">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {additional.certifications && (
                    <div>
                      <div className="font-bold border-b border-white/20 pb-0.5 mb-1 uppercase text-[9px] tracking-wider" style={{ color: accentColor }}>
                        Certifications
                      </div>
                      <p className="text-[8.5px] opacity-85">{additional.certifications}</p>
                    </div>
                  )}
                </div>

                {/* Main Content Column */}
                <div className="w-2/3 p-3 rounded-2xl space-y-3 shadow-sm" style={{ backgroundColor: cardBgColor }}>
                  {personal.summary && (
                    <div>
                      <div className="font-bold border-b-2 pb-0.5 mb-1 uppercase text-[9.5px] tracking-wider" style={{ borderColor: accentColor, color: headerBg }}>
                        Executive Summary
                      </div>
                      <p className="text-[9px] leading-relaxed opacity-90">{personal.summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div>
                      <div className="font-bold border-b-2 pb-0.5 mb-1 uppercase text-[9.5px] tracking-wider" style={{ borderColor: accentColor, color: headerBg }}>
                        Work Experience
                      </div>
                      {experience.map((exp, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="font-bold text-[9.5px]">{exp.role}</div>
                          <div className="text-[8.5px] font-semibold" style={{ color: accentColor }}>{exp.company} ({exp.dates})</div>
                          <p className="text-[8.5px] opacity-80 line-clamp-3 mt-0.5">{exp.bullets}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {customSections.length > 0 && (
                    <div>
                      {customSections.map((cs, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="font-bold border-b-2 pb-0.5 mb-1 uppercase text-[9.5px] tracking-wider" style={{ borderColor: accentColor, color: headerBg }}>
                            {cs.title}
                          </div>
                          <p className="text-[8.5px] opacity-80">{cs.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center mt-2">
          <div className="text-xs text-slate-400 font-semibold hidden sm:block">
            Supports PDF, DOCX, Markdown & HTML Export
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportDocx}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" /> Export DOCX
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Vector Graphic PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
