import React, { useState } from 'react';
import { X, Globe, Download, Copy, Check, Eye, Edit3, Camera } from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, resumeData }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [accentColor, setAccentColor] = useState('#059669'); // Emerald Green default

  // Editable Portfolio State initialized from resumeData or high quality defaults
  const [portfolio, setPortfolio] = useState({
    fullName: resumeData?.fullName || 'Alex Vance',
    title: resumeData?.title || 'Senior AI & Systems Engineer',
    about: resumeData?.summary || 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
    email: resumeData?.email || 'alex.vance@example.com',
    phone: resumeData?.phone || '+1 (555) 019-2834',
    location: resumeData?.location || 'San Francisco, CA',
    linkedin: resumeData?.linkedin || 'linkedin.com/in/alexvance',
    github: resumeData?.github || 'github.com/alexvance',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    skills: resumeData?.skills || 'Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, PostgreSQL, Docker, Git',
    experience: resumeData?.experience || [
      { company: 'NeuralTech AI', role: 'Lead AI Engineer', dates: '2022 - Present', bullets: 'Architected enterprise RAG document retrieval engines, scaling query throughput by 300%.' },
      { company: 'DataFlow Systems', role: 'Software Engineer', dates: '2019 - 2022', bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.' }
    ],
    education: resumeData?.education || [
      { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019' }
    ],
    projects: resumeData?.projects || [
      { name: 'NovaResume AI', description: 'Enterprise AI Resume Builder with Canva-style graphic editor and single-page ATS vector PDF generator.' }
    ],
    services: [
      { title: 'AI & LLM Architecture', desc: 'Designing production RAG pipelines, model fine-tuning, and high-throughput streaming APIs.' },
      { title: 'Full Stack Engineering', desc: 'Building responsive React/TypeScript frontends and async FastAPI/Python microservices.' },
      { title: 'Technical Leadership', desc: 'Leading engineering teams, establishing CI/CD pipelines, and conducting architecture audits.' }
    ],
    certifications: resumeData?.certifications || 'AWS Certified Machine Learning Specialist',
    achievements: resumeData?.achievements || 'Winner of Global AI Innovation Hackathon (1st Place)'
  });

  if (!isOpen) return null;

  const skillsList = (portfolio.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolio(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate self-contained HTML with embedded CSS for 100% offline browser compatibility
  const generatedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.fullName} - ${portfolio.title} | Personal Portfolio</title>
  <style>
    :root {
      --primary: ${accentColor};
      --bg: #ffffff;
      --text: #0f172a;
      --card-bg: #f8fafc;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: var(--bg); color: var(--text); line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    .hero { text-align: center; padding: 60px 20px; background: #f0fdf4; border-radius: 24px; margin-bottom: 40px; border: 1px solid #d1fae5; }
    .avatar { width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 12px; background: #d1fae5; color: var(--primary); font-size: 12px; font-weight: 700; border-radius: 20px; margin-bottom: 12px; }
    h1 { font-size: 36px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px; }
    .subtitle { font-size: 18px; color: var(--primary); font-weight: 700; margin-bottom: 16px; }
    .about-text { font-size: 15px; color: #475569; max-width: 650px; margin: 0 auto 24px; }
    .btn { display: inline-block; padding: 10px 24px; background: var(--primary); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 12px; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    section { margin-bottom: 40px; }
    .section-title { font-size: 20px; font-weight: 800; border-bottom: 3px solid var(--primary); padding-bottom: 6px; margin-bottom: 20px; color: var(--text); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); padding: 20px; border-radius: 16px; }
    .card-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; color: var(--text); }
    .card-sub { font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 8px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 4px 12px; background: #ffffff; border: 1px solid var(--border); font-size: 12px; font-weight: 600; border-radius: 8px; color: #334155; }
    footer { text-align: center; border-top: 1px solid var(--border); padding-top: 24px; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      ${portfolio.photoUrl ? `<img src="${portfolio.photoUrl}" alt="${portfolio.fullName}" class="avatar">` : ''}
      <div><span class="badge">Available for Opportunities</span></div>
      <h1>${portfolio.fullName}</h1>
      <div class="subtitle">${portfolio.title}</div>
      <p class="about-text">${portfolio.about}</p>
      <a href="#contact" class="btn">Contact & Hire Me</a>
    </div>

    <section>
      <div class="section-title">Skills & Expertise</div>
      <div class="chips">
        ${skillsList.map((s: string) => `<span class="chip">${s}</span>`).join('\n        ')}
      </div>
    </section>

    <section>
      <div class="section-title">Professional Experience</div>
      <div class="grid">
        ${(portfolio.experience || []).map((exp: any) => `
        <div class="card">
          <div class="card-title">${exp.role}</div>
          <div class="card-sub">${exp.company} (${exp.dates})</div>
          <p style="font-size: 13px; color: #475569;">${(exp.bullets || '').replace(/\n/g, '<br>')}</p>
        </div>`).join('\n')}
      </div>
    </section>

    <section>
      <div class="section-title">Services Offered</div>
      <div class="grid">
        ${(portfolio.services || []).map((serv: any) => `
        <div class="card">
          <div class="card-title">${serv.title}</div>
          <p style="font-size: 13px; color: #475569; margin-top: 6px;">${serv.desc}</p>
        </div>`).join('\n')}
      </div>
    </section>

    <section>
      <div class="section-title">Featured Projects</div>
      <div class="grid">
        ${(portfolio.projects || []).map((p: any) => `
        <div class="card">
          <div class="card-title">${p.name}</div>
          <p style="font-size: 13px; color: #475569; margin-top: 6px;">${p.description}</p>
        </div>`).join('\n')}
      </div>
    </section>

    <section id="contact">
      <div class="section-title">Get In Touch</div>
      <div class="card" style="text-align: center; padding: 30px;">
        <p style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">Interested in working together?</p>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">📧 ${portfolio.email} | ✆ ${portfolio.phone} | ⌖ ${portfolio.location}</p>
        <a href="mailto:${portfolio.email}" class="btn">Send Email</a>
      </div>
    </section>

    <footer>
      <p>© ${new Date().getFullYear()} ${portfolio.fullName}. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
  `.trim();

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${portfolio.fullName.toLowerCase().replace(/ /g, '_')}_portfolio.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl p-6 relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Personal Web Portfolio Generator</h2>
              <p className="text-xs text-slate-500">Standalone, 100% self-contained HTML/CSS portfolio website generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${activeTab === 'preview' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${activeTab === 'editor' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Portfolio Content</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Editor Form OR Live Website Canvas Preview */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'editor' ? (
            <div className="space-y-4 text-xs">
              {/* Palette Selection */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Portfolio Accent Theme</span>
                <div className="flex gap-2">
                  {[
                    { name: 'Emerald', hex: '#059669' },
                    { name: 'Forest', hex: '#14532d' },
                    { name: 'Teal', hex: '#0d9488' },
                    { name: 'Navy', hex: '#1e3a8a' }
                  ].map(c => (
                    <button
                      key={c.name}
                      onClick={() => setAccentColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 ${accentColor === c.hex ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Profile Photo Upload Section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                {portfolio.photoUrl ? (
                  <img src={portfolio.photoUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-md flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">No Photo</div>
                )}
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <label className="font-bold text-slate-800 text-xs block">Profile Avatar Photo</label>
                  <p className="text-[11px] text-slate-500">Upload a custom profile photo (Embedded offline in downloaded HTML)</p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm transition-transform active:scale-95">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {portfolio.photoUrl && (
                      <button
                        onClick={() => setPortfolio(prev => ({ ...prev, photoUrl: '' }))}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={portfolio.fullName}
                    onChange={(e) => setPortfolio({ ...portfolio, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={portfolio.title}
                    onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">About Me & Career Narrative</label>
                <textarea
                  value={portfolio.about}
                  onChange={(e) => setPortfolio({ ...portfolio, about: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={portfolio.email}
                    onChange={(e) => setPortfolio({ ...portfolio, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={portfolio.phone}
                    onChange={(e) => setPortfolio({ ...portfolio, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={portfolio.location}
                    onChange={(e) => setPortfolio({ ...portfolio, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Skills & Tech Stack (Comma-separated)</label>
                <textarea
                  value={portfolio.skills}
                  onChange={(e) => setPortfolio({ ...portfolio, skills: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          ) : (
            /* Live Web Preview Canvas */
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono text-slate-500 flex items-center justify-between border-b border-slate-200">
                <span>https://portfolio.novaresume.ai/{portfolio.fullName.toLowerCase().replace(/ /g, '')}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% Offline Single HTML</span>
              </div>

              <div className="p-8 space-y-8 bg-white text-slate-900 font-sans">
                {/* Hero Section */}
                <div className="text-center p-8 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
                  {portfolio.photoUrl && (
                    <img src={portfolio.photoUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-600 shadow-md" />
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900 inline-block">Available for Hire</span>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{portfolio.fullName}</h1>
                  <p className="text-sm font-bold text-emerald-700">{portfolio.title}</p>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">{portfolio.about}</p>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1">Tech Stack & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((s: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1">Work Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(portfolio.experience || []).map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="font-bold text-xs text-slate-900">{exp.role}</div>
                        <div className="text-xs font-semibold text-emerald-700">{exp.company} ({exp.dates})</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">{exp.bullets}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Offered */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-emerald-600 pb-1">Services Offered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(portfolio.services || []).map((s: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="font-bold text-xs text-slate-900">{s.title}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>

          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Self-Contained Portfolio HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
};
