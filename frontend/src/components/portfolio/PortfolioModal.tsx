import React, { useState } from 'react';
import {
  X, Globe, Download, Copy, Check, Eye, Edit3, Camera, Plus, Trash2,
  Award, Briefcase, Monitor, Smartphone, Palette, Share2, Layers, CheckCircle2, FileText, Upload,
  Code, Terminal, Cpu, GraduationCap
} from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export type PortfolioStyle = 'developer' | 'software' | 'ai_engineer' | 'student' | 'executive' | 'creative';

interface ProjectItem {
  title: string;
  description: string;
  image?: string;
  techTags: string[];
  githubUrl: string;
  demoUrl: string;
  isFeatured: boolean;
}

interface StatItem {
  label: string;
  value: string;
}

const PORTFOLIO_STYLES: { id: PortfolioStyle; name: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'developer', name: 'Developer Pro', desc: 'Modern high-contrast dark architecture with structured tech badges', icon: Terminal },
  { id: 'software', name: 'Software Engineer', desc: 'Clean engineering layout with code metrics and system focus', icon: Code },
  { id: 'ai_engineer', name: 'AI / Systems Specialist', desc: 'Enterprise layout with model metrics and technical showcase', icon: Cpu },
  { id: 'student', name: 'Early Career & Graduate', desc: 'Structured layout highlighting core coursework and technical projects', icon: GraduationCap },
  { id: 'executive', name: 'Executive Leader', desc: 'Corporate identity with leadership milestones and verified track record', icon: Briefcase },
  { id: 'creative', name: 'Product & Visual Showcase', desc: 'Case study showcase grid with structured project metadata', icon: Layers },
];

const PALETTES = [
  { name: 'Emerald', hex: '#059669', rgb: '5, 150, 105' },
  { name: 'Royal Blue', hex: '#2563eb', rgb: '37, 99, 235' },
  { name: 'Violet Glow', hex: '#7c3aed', rgb: '124, 58, 237' },
  { name: 'Teal Modern', hex: '#0d9488', rgb: '13, 148, 136' },
  { name: 'Rose Gold', hex: '#e11d48', rgb: '225, 29, 72' },
  { name: 'Amber Gold', hex: '#d97706', rgb: '217, 119, 6' },
  { name: 'Cyan Tech', hex: '#0891b2', rgb: '8, 145, 178' },
];

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, resumeData }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'content' | 'projects' | 'experience_skills' | 'cert_stats' | 'design'>('preview');
  const [copied, setCopied] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Editable Portfolio State initialized from resumeData or high quality defaults
  const [portfolio, setPortfolio] = useState({
    style: 'developer' as PortfolioStyle,
    accentColor: '#059669',
    fullName: resumeData?.fullName || 'Alex Vance',
    title: resumeData?.title || 'Senior AI & Systems Engineer',
    tagline: 'Building Scalable AI Infrastructure & Full-Stack Cloud Applications',
    about: resumeData?.summary || 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
    email: resumeData?.email || 'alex.vance@example.com',
    phone: resumeData?.phone || '+1 (555) 019-2834',
    location: resumeData?.location || 'San Francisco, CA',
    linkedin: resumeData?.linkedin || 'linkedin.com/in/alexvance',
    github: resumeData?.github || 'github.com/alexvance',
    twitter: 'twitter.com/alexvance_dev',
    website: 'https://alexvance.dev',
    resumeUrl: '#',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    skills: resumeData?.skills || 'Python, FastAPI, Groq API, PyTorch, LangChain, React, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, Git',
    experience: resumeData?.experience || [
      { company: 'NeuralTech AI', role: 'Lead AI Engineer', dates: '2022 - Present', bullets: 'Architected enterprise RAG document retrieval engines, scaling query throughput by 300%.\nEngineered streaming LLM middleware with sub-100ms first token latency.' },
      { company: 'DataFlow Systems', role: 'Software Engineer', dates: '2019 - 2022', bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.\nOptimized PostgreSQL database queries, reducing API latency by 45%.' }
    ],
    education: resumeData?.education || [
      { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019', gpa: '3.9 GPA' }
    ],
    projects: (resumeData?.projects && resumeData.projects.length > 0) ? resumeData.projects.map((p: any) => ({
      title: p.name || p.title || 'NovaResume AI Platform',
      description: p.description || 'Enterprise AI Resume Builder with Canva-style graphic editor and single-page ATS vector PDF generator.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      techTags: ['React', 'TypeScript', 'FastAPI', 'Groq API', 'Tailwind CSS'],
      githubUrl: 'https://github.com/alexvance/novaresume-ai',
      demoUrl: 'https://novaresume-ai.netlify.app',
      isFeatured: true
    })) : [
      {
        title: 'NovaResume AI Platform',
        description: 'Enterprise AI Resume Builder with Canva-style graphic editor, ATS match scoring, and single-page A4 vector PDF generator.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        techTags: ['React', 'TypeScript', 'FastAPI', 'Groq API', 'Tailwind CSS'],
        githubUrl: 'https://github.com/alexvance/novaresume-ai',
        demoUrl: 'https://novaresume-ai.netlify.app',
        isFeatured: true
      },
      {
        title: 'RAG Vector Document Pipeline',
        description: 'High-throughput document retrieval system using FAISS vector indexing, hybrid search, and Groq Llama-3 acceleration.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        techTags: ['Python', 'LangChain', 'FAISS', 'FastAPI', 'Docker'],
        githubUrl: 'https://github.com/alexvance/rag-vector-pipeline',
        demoUrl: 'https://rag-demo.novaresume.ai',
        isFeatured: true
      },
      {
        title: 'Real-Time Telemetry Dashboard',
        description: 'Sub-second metrics monitoring console built for distributed Kubernetes microservices and model latency telemetry.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        techTags: ['React', 'TypeScript', 'WebSockets', 'Recharts'],
        githubUrl: 'https://github.com/alexvance/telemetry-dash',
        demoUrl: 'https://dash.novaresume.ai',
        isFeatured: false
      }
    ] as ProjectItem[],
    stats: [
      { label: 'Years Experience', value: '6+' },
      { label: 'Projects Shipped', value: '25+' },
      { label: 'Code Commits', value: '2,400+' },
      { label: 'Client Satisfaction', value: '99.8%' }
    ] as StatItem[],
    services: [
      { title: 'AI & LLM Architecture', desc: 'Designing production RAG pipelines, fine-tuning LLMs, and building high-throughput streaming APIs.' },
      { title: 'Full-Stack Web Development', desc: 'Creating responsive React/TypeScript frontends paired with async FastAPI & Python microservices.' },
      { title: 'Cloud Infrastructure & DevOps', desc: 'Setting up Docker containerization, Kubernetes deployments, and automated CI/CD pipelines.' }
    ],
    certifications: [
      { name: 'AWS Certified Machine Learning Specialist', issuer: 'Amazon Web Services', date: '2023' },
      { name: 'Deep Learning Specialization', issuer: 'Coursera / DeepLearning.AI', date: '2022' }
    ],
    achievements: [
      { title: '1st Place Winner - Global AI Hackathon', date: '2023', description: 'Awarded 1st place out of 500+ teams for building an open-source RAG document analyzer.' },
      { title: 'Speaker - TechCon Developer Summit', date: '2022', description: 'Delivered keynote presentation on scaling async Python APIs with FastAPI.' }
    ]
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

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolio(prev => ({ ...prev, resumeUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Edit / Remove Project Helpers
  const handleAddProject = () => {
    setPortfolio(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: 'New Project',
          description: 'Short description of your project accomplishments and technologies used.',
          image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
          techTags: ['React', 'Python', 'Tailwind'],
          githubUrl: 'https://github.com',
          demoUrl: 'https://example.com',
          isFeatured: false
        }
      ]
    }));
  };

  const handleUpdateProject = (index: number, field: keyof ProjectItem, value: any) => {
    setPortfolio(prev => {
      const nextProjects = [...prev.projects];
      nextProjects[index] = { ...nextProjects[index], [field]: value };
      return { ...prev, projects: nextProjects };
    });
  };

  const handleRemoveProject = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      projects: prev.projects.filter((_item: ProjectItem, i: number) => i !== index)
    }));
  };

  // ── GENERATE 100% SELF-CONTAINED STANDALONE HTML WEBSITE BUNDLE ──
  const generatedHtml = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${portfolio.fullName} - ${portfolio.title}. ${portfolio.tagline}">
  <meta property="og:title" content="${portfolio.fullName} | Portfolio">
  <meta property="og:description" content="${portfolio.about.slice(0, 150)}...">
  <meta property="og:image" content="${portfolio.photoUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${portfolio.fullName} | ${portfolio.title}</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --primary: ${portfolio.accentColor};
      --primary-glow: ${portfolio.accentColor}33;
      --bg-dark: #090d16;
      --bg-card-dark: #111827;
      --border-dark: #1f2937;
      --text-dark: #f8fafc;
      --text-muted-dark: #94a3b8;
      
      --bg-light: #f8fafc;
      --bg-card-light: #ffffff;
      --border-light: #e2e8f0;
      --text-light: #0f172a;
      --text-muted-light: #64748b;
    }
    
    html.dark {
      --bg: var(--bg-dark);
      --bg-card: var(--bg-card-dark);
      --border: var(--border-dark);
      --text: var(--text-dark);
      --text-muted: var(--text-muted-dark);
    }
    
    html.light {
      --bg: var(--bg-light);
      --bg-card: var(--bg-card-light);
      --border: var(--border-light);
      --text: var(--text-light);
      --text-muted: var(--text-muted-light);
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: var(--bg); color: var(--text); line-height: 1.6; transition: background-color 0.3s, color 0.3s; }
    
    /* Scroll Progress Bar */
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--primary); z-index: 10000; width: 0%; transition: width 0.1s; }
    
    /* Navigation Bar */
    header { position: sticky; top: 0; background: rgba(9, 13, 22, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); z-index: 1000; padding: 16px 24px; }
    html.light header { background: rgba(255, 255, 255, 0.85); }
    .nav-container { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 20px; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .logo-badge { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); display: inline-block; box-shadow: 0 0 10px var(--primary); }
    .nav-links { display: flex; gap: 24px; align-items: center; list-style: none; }
    .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 600; transition: color 0.2s; }
    .nav-links a:hover { color: var(--primary); }
    .theme-toggle-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s; }
    .theme-toggle-btn:hover { border-color: var(--primary); transform: scale(1.05); }
    
    /* Layout Containers */
    .container { max-width: 1100px; margin: 0 auto; padding: 60px 24px; }
    .section-header { margin-bottom: 40px; text-align: center; }
    .section-subtitle { font-size: 12px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--primary); margin-bottom: 6px; }
    .section-title { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -0.5px; }
    
    /* Hero Section */
    .hero-grid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: center; padding: 40px 0 80px; }
    @media (max-width: 868px) { .hero-grid { grid-template-columns: 1fr; text-align: center; } }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: var(--primary-glow); border: 1px solid var(--primary); color: var(--primary); font-size: 12px; font-weight: 800; border-radius: 30px; margin-bottom: 20px; }
    .hero-title { font-family: 'Outfit', sans-serif; font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1px; }
    .hero-tagline { font-size: 18px; color: var(--primary); font-weight: 700; margin-bottom: 16px; min-height: 28px; }
    .hero-about { font-size: 15px; color: var(--text-muted); line-height: 1.7; margin-bottom: 28px; max-width: 620px; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    @media (max-width: 868px) { .hero-actions { justify-content: center; } }
    
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 26px; border-radius: 14px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.25s; cursor: pointer; border: none; }
    .btn-primary { background: var(--primary); color: #ffffff; box-shadow: 0 4px 20px var(--primary-glow); }
    .btn-primary:hover { opacity: 0.92; transform: translateY(-2px); }
    .btn-secondary { background: var(--bg-card); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--primary); transform: translateY(-2px); }
    
    /* Animated Avatar Card */
    .profile-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 24px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .profile-avatar { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); box-shadow: 0 0 30px var(--primary-glow); margin: 0 auto 16px; }
    .social-row { display: flex; justify-content: center; gap: 12px; margin-top: 16px; }
    .social-icon { width: 38px; height: 38px; border-radius: 50%; background: var(--bg); border: 1px solid var(--border); color: var(--text); display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .social-icon:hover { border-color: var(--primary); color: var(--primary); transform: scale(1.1); }
    
    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 60px; }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; border-radius: 20px; text-align: center; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-4px); border-color: var(--primary); }
    .stat-value { font-family: 'Outfit', sans-serif; font-size: 36px; font-weight: 900; color: var(--primary); }
    .stat-label { font-size: 13px; font-weight: 700; color: var(--text-muted); margin-top: 4px; }
    
    /* Projects Cards Grid */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; }
    .project-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; }
    .project-card:hover { transform: translateY(-6px); border-color: var(--primary); box-shadow: 0 12px 30px var(--primary-glow); }
    .project-img { width: 100%; height: 190px; object-fit: cover; }
    .project-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    .project-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--primary); background: var(--primary-glow); padding: 3px 10px; border-radius: 10px; align-self: flex-start; margin-bottom: 8px; }
    .project-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
    .project-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; flex: 1; }
    .tech-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .tech-chip { font-size: 11px; font-weight: 700; background: var(--bg); border: 1px solid var(--border); padding: 3px 10px; border-radius: 8px; color: var(--text-muted); }
    .project-links { display: flex; gap: 10px; padding-top: 12px; border-top: 1px solid var(--border); }
    .link-btn { font-size: 12px; font-weight: 700; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 4px; }
    .link-btn:hover { color: var(--primary); }
    
    /* Timeline Tree */
    .timeline { position: relative; padding-left: 28px; border-left: 2px solid var(--border); margin-top: 20px; }
    .timeline-item { position: relative; margin-bottom: 28px; }
    .timeline-dot { position: absolute; left: -35px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
    .timeline-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; border-radius: 18px; }
    .timeline-role { font-size: 16px; font-weight: 800; }
    .timeline-meta { font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 8px; }
    
    /* Skills Chips */
    .skills-wrapper { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .skill-badge { font-size: 13px; font-weight: 700; padding: 8px 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; transition: all 0.2s; }
    .skill-badge:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
    
    /* Contact Box & Form */
    .contact-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 28px; padding: 40px; text-align: center; max-width: 750px; margin: 0 auto; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; text-align: left; }
    @media (max-width: 600px) { .contact-grid { grid-template-columns: 1fr; } }
    .form-input { width: 100%; padding: 12px 16px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 12px; font-size: 13px; }
    .form-input:focus { outline: none; border-color: var(--primary); }
    
    /* Mobile Hamburger Menu */
    .mobile-menu-btn {
      display: none;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      font-size: 20px;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .mobile-menu-btn:hover { border-color: var(--primary); }
    .mobile-nav-drawer {
      display: none;
      flex-direction: column;
      gap: 10px;
      padding: 16px 0 8px;
      border-top: 1px solid var(--border);
      margin-top: 12px;
    }
    .mobile-nav-drawer.open { display: flex !important; }
    .mobile-nav-drawer a {
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 14px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border);
      transition: border-color 0.2s;
    }
    .mobile-nav-drawer a:hover { border-color: var(--primary); color: var(--primary); }

    /* Mobile Responsive Overrides for 320px - 768px Viewports */
    @media (max-width: 768px) {
      header { padding: 12px 16px; }
      .nav-links { display: none !important; }
      .mobile-menu-btn { display: flex !important; }
      .container { padding: 32px 16px; }
      .hero-grid { grid-template-columns: 1fr; text-align: center; padding: 20px 0 40px; gap: 24px; }
      .hero-title { font-size: 28px; letter-spacing: -0.5px; }
      .hero-tagline { font-size: 15px; min-height: auto; }
      .hero-about { font-size: 13px; margin-bottom: 20px; text-align: center; margin-left: auto; margin-right: auto; }
      .hero-actions { flex-direction: column; width: 100%; justify-content: center; }
      .btn { width: 100%; justify-content: center; padding: 12px 18px; }
      .profile-card { padding: 20px; border-radius: 22px; }
      .profile-avatar { width: 110px; height: 110px; }
      .projects-grid { grid-template-columns: 1fr; gap: 16px; }
      .project-card { border-radius: 18px; }
      .project-img { height: 160px; }
      .project-body { padding: 16px; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
      .stat-card { padding: 16px; border-radius: 16px; }
      .stat-value { font-size: 26px; }
      .stat-label { font-size: 11px; }
      .timeline { padding-left: 20px; }
      .timeline-card { padding: 14px; border-radius: 14px; }
      .contact-card { padding: 20px; border-radius: 20px; }
      .contact-grid { grid-template-columns: 1fr !important; }
      .contact-grid textarea, .contact-grid button { grid-column: span 1 !important; }
      .section-title { font-size: 22px; }
      .skill-badge { font-size: 11px; padding: 6px 12px; }
    }
  </style>
</head>
<body>
  <div id="progress-bar"></div>

  <!-- Header Navigation -->
  <header>
    <div class="nav-container">
      <a href="javascript:void(0)" onclick="return scrollToSection(event, 'top')" class="logo">
        <span class="logo-badge"></span>
        <span>${portfolio.fullName}</span>
      </a>
      <ul class="nav-links">
        <li><a href="javascript:void(0)" onclick="return scrollToSection(event, 'about')">About</a></li>
        <li><a href="javascript:void(0)" onclick="return scrollToSection(event, 'projects')">Projects</a></li>
        <li><a href="javascript:void(0)" onclick="return scrollToSection(event, 'experience')">Experience</a></li>
        <li><a href="javascript:void(0)" onclick="return scrollToSection(event, 'contact')">Contact</a></li>
        <li>
          <button type="button" onclick="toggleTheme()" class="theme-toggle-btn" id="theme-btn">Dark Mode</button>
        </li>
      </ul>
      <button type="button" onclick="toggleMobileNav()" class="mobile-menu-btn" id="mobile-toggle" aria-label="Toggle Menu">Menu</button>
    </div>
    <div class="mobile-nav-drawer" id="mobile-drawer">
      <a href="javascript:void(0)" onclick="closeMobileNav(); return scrollToSection(event, 'about')">About</a>
      <a href="javascript:void(0)" onclick="closeMobileNav(); return scrollToSection(event, 'projects')">Projects</a>
      <a href="javascript:void(0)" onclick="closeMobileNav(); return scrollToSection(event, 'experience')">Experience</a>
      <a href="javascript:void(0)" onclick="closeMobileNav(); return scrollToSection(event, 'contact')">Contact</a>
      <button type="button" onclick="toggleTheme()" class="theme-toggle-btn" style="width: 100%; margin-top: 4px;">Dark Mode</button>
    </div>
  </header>

  <div class="container">
    <!-- Hero Section -->
    <section id="about" class="hero-grid reveal active">
      <div>
        <div class="hero-badge">
          <span>Available for High-Impact Roles</span>
        </div>
        <h1 class="hero-title">${portfolio.fullName}</h1>
        <div class="hero-tagline" id="typing-text">${portfolio.title}</div>
        <p class="hero-about">${portfolio.about}</p>

        <div class="hero-actions">
          <a href="javascript:void(0)" onclick="return scrollToSection(event, 'contact')" class="btn btn-primary">Contact Direct</a>
          ${portfolio.resumeUrl && portfolio.resumeUrl !== '#' 
            ? `<a href="${portfolio.resumeUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer" download="${portfolio.fullName.toLowerCase().replace(/ /g, '_')}_resume">Download Resume</a>` 
            : `<a href="javascript:void(0)" onclick="return scrollToSection(event, 'contact')" class="btn btn-secondary">Request Resume</a>`}
        </div>
      </div>

      <div class="profile-card">
        <img src="${portfolio.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}" alt="${portfolio.fullName}" class="profile-avatar">
        <h3 style="font-size: 18px; font-weight: 800;">${portfolio.fullName}</h3>
        <p style="font-size: 12px; color: var(--primary); font-weight: 700;">${portfolio.location}</p>
        
        <div class="social-row">
          ${portfolio.github ? `<a href="https://${portfolio.github.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener noreferrer" class="social-icon">GH</a>` : ''}
          ${portfolio.linkedin ? `<a href="https://${portfolio.linkedin.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener noreferrer" class="social-icon">IN</a>` : ''}
          ${portfolio.email ? `<a href="mailto:${portfolio.email}" class="social-icon">@</a>` : ''}
        </div>
      </div>
    </section>

    <!-- Statistics Highlights -->
    <section class="stats-grid reveal">
      ${(portfolio.stats || []).map(s => `
        <div class="stat-card">
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('')}
    </section>

    <!-- Featured Projects Grid -->
    <section id="projects" style="margin-bottom: 80px;" class="reveal">
      <div class="section-header">
        <div class="section-subtitle">Portfolio Showcase</div>
        <h2 class="section-title">Featured Projects & Products</h2>
      </div>

      <div class="projects-grid">
        ${(portfolio.projects || []).map((p: any) => `
          <div class="project-card">
            ${p.image ? `<img src="${p.image}" alt="${p.title}" class="project-img">` : ''}
            <div class="project-body">
              ${p.isFeatured ? `<span class="project-badge">★ Featured Project</span>` : ''}
              <h3 class="project-title">${p.title}</h3>
              <p class="project-desc">${p.description}</p>
              
              <div class="tech-chips">
                ${(p.techTags || []).map((t: string) => `<span class="tech-chip">${t}</span>`).join('')}
              </div>
              
              <div class="project-links">
                ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" class="link-btn">Live Demo ↗</a>` : ''}
                ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="link-btn">Source Code ↗</a>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Skills & Expertise -->
    <section style="margin-bottom: 80px;" class="reveal">
      <div class="section-header">
        <div class="section-subtitle">Technical Proficiency</div>
        <h2 class="section-title">Skills & Tools</h2>
      </div>

      <div class="skills-wrapper">
        ${skillsList.map((s: string) => `<div class="skill-badge">${s}</div>`).join('')}
      </div>
    </section>

    <!-- Professional Experience Timeline -->
    <section id="experience" style="margin-bottom: 80px;" class="reveal">
      <div class="section-header">
        <div class="section-subtitle">Career Path</div>
        <h2 class="section-title">Work Experience</h2>
      </div>

      <div class="timeline">
        ${(portfolio.experience || []).map((exp: any) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <h3 class="timeline-role">${exp.role}</h3>
              <div class="timeline-meta">${exp.company} | ${exp.dates}</div>
              <p style="font-size: 13px; color: var(--text-muted);">${(exp.bullets || '').replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Contact CTA -->
    <section id="contact" style="margin-bottom: 60px;" class="reveal">
      <div class="contact-card">
        <h2 class="section-title" style="margin-bottom: 12px;">Get In Touch</h2>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">Have a project inquiry or interested in hiring? Send a message directly.</p>

        <form onsubmit="return handleContactSubmit(event)" class="contact-grid">
          <input type="text" placeholder="Your Name" required class="form-input">
          <input type="email" placeholder="Your Email" required class="form-input">
          <textarea placeholder="Your Message" rows="3" required class="form-input" style="grid-column: span 2;"></textarea>
          <button type="submit" class="btn btn-primary" style="grid-column: span 2; justify-content: center;">Send Direct Message</button>
          <div id="contact-success-msg" style="display:none; grid-column: span 2; padding: 12px 16px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 700; font-size: 13px; text-align: center;">
            ✓ Thank you! Your message has been sent successfully.
          </div>
        </form>

        <div style="font-size: 13px; color: var(--text-muted); margin-top: 16px;">
          ${portfolio.email} • ${portfolio.location}
        </div>
      </div>
    </section>
  </div>

  <footer>
    <p>© ${new Date().getFullYear()} ${portfolio.fullName}. Published via NovaResume AI.</p>
  </footer>

  <script>
    // Smooth In-Page Section Scroll Handler (prevents any iframe URL navigation or parent reloading)
    function scrollToSection(e, id) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      if (!id || id === 'top' || id === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
      const cleanId = String(id).replace(/^#/, '');
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return false;
    }

    // Capture-phase link click interceptor - 100% blocks iframe navigation for relative/anchor URLs
    document.addEventListener('click', function(e) {
      const link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#')) {
        e.preventDefault();
        e.stopPropagation();
        const id = href.replace(/^#/, '');
        scrollToSection(e, id || 'top');
        return false;
      }

      if (href.startsWith('http://') || href.startsWith('https://')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    }, true);

    // Mobile Drawer Navigation Toggle
    function toggleMobileNav() {
      const drawer = document.getElementById('mobile-drawer');
      const btn = document.getElementById('mobile-toggle');
      if (!drawer) return;
      if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        if (btn) btn.innerText = 'Menu';
      } else {
        drawer.classList.add('open');
        if (btn) btn.innerText = 'Close';
      }
    }
    function closeMobileNav() {
      const drawer = document.getElementById('mobile-drawer');
      const btn = document.getElementById('mobile-toggle');
      if (drawer) {
        drawer.classList.remove('open');
        if (btn) btn.innerText = 'Menu';
      }
    }

    // Scroll Progress Indicator
    window.onscroll = function() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const bar = document.getElementById("progress-bar");
      if (bar) bar.style.width = scrolled + "%";
    };

    // Dark / Light Theme Toggle
    function toggleTheme() {
      const html = document.documentElement;
      const btn = document.getElementById('theme-btn');
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        if (btn) btn.innerText = 'Dark Mode';
      } else {
        html.classList.remove('light');
        html.classList.add('dark');
        if (btn) btn.innerText = 'Light Mode';
      }
    }

    // Scroll Reveal Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Contact Form Simulation without alert()
    function handleContactSubmit(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      const msg = document.getElementById('contact-success-msg');
      if (msg) {
        msg.style.display = 'block';
        setTimeout(function() { msg.style.display = 'none'; }, 4000);
      }
      if (e && e.target && typeof e.target.reset === 'function') {
        e.target.reset();
      }
      return false;
    }
  </script>
</body>
</html>
  `.trim();

  // Export File & Copy Handlers
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

  const handlePublishPortfolio = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setPublishedUrl(url);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="glass-modal rounded-none sm:rounded-3xl w-full max-w-6xl shadow-2xl p-3 sm:p-6 relative flex flex-col h-full sm:h-[94vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Topbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/70 flex-shrink-0 gap-2">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl glass-emerald text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>AI Web Portfolio Pro</span>
                  <span className="px-2 py-0.5 rounded-full glass-emerald text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold uppercase">
                    Self-Contained HTML
                  </span>
                </h2>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 transition-colors sm:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Mode Switcher */}
            <div className="flex gap-1 glass-card p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab !== 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize Portfolio</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 transition-colors hidden sm:block cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden py-3 flex flex-col min-h-0">
          
          {/* Sub-Navigation Tabs for Content Editing */}
          {activeTab !== 'preview' && (
            <div className="flex overflow-x-auto gap-1 glass-card p-1 rounded-xl mb-3 flex-shrink-0 scrollbar-none">
              {[
                { id: 'content', label: 'Personal & Social', icon: Edit3 },
                { id: 'projects', label: 'Projects & Work', icon: Layers },
                { id: 'experience_skills', label: 'Skills & Timeline', icon: Briefcase },
                { id: 'cert_stats', label: 'Stats & Achievements', icon: Award },
                { id: 'design', label: 'Themes & Styles', icon: Palette }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 1: LIVE PREVIEW CANVAS */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-slate-900">
              {/* Browser Header Bar */}
              <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    https://{portfolio.fullName.toLowerCase().replace(/ /g, '')}.novaresume.ai
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDeviceMode('desktop')}
                    className={`p-1.5 rounded-lg text-xs ${previewDeviceMode === 'desktop' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDeviceMode('mobile')}
                    className={`p-1.5 rounded-lg text-xs ${previewDeviceMode === 'mobile' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time HTML Preview Frame */}
              <div className={`flex-1 overflow-hidden flex justify-center bg-slate-950 ${previewDeviceMode === 'mobile' ? 'p-4' : ''}`}>
                <iframe
                  srcDoc={generatedHtml}
                  title="Portfolio Live Preview"
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
                  className={`w-full h-full border-0 transition-all duration-300 ${
                    previewDeviceMode === 'mobile' ? 'max-w-[375px] rounded-3xl border-4 border-slate-800 shadow-2xl' : ''
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL & SOCIAL CONTENT */}
          {activeTab === 'content' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                {portfolio.photoUrl ? (
                  <img src={portfolio.photoUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-600 shadow-md flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs flex-shrink-0">No Photo</div>
                )}
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <label className="font-extrabold text-slate-900 text-xs block">Profile Avatar Photo</label>
                  <p className="text-[11px] text-slate-500">Upload a profile photo. Converts automatically to Base64 to stay 100% offline compliant.</p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-transform active:scale-95">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Avatar</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {portfolio.photoUrl && (
                      <button
                        onClick={() => setPortfolio(prev => ({ ...prev, photoUrl: '' }))}
                        className="px-3 py-2 bg-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={portfolio.fullName}
                    onChange={(e) => setPortfolio({ ...portfolio, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">Primary Designation / Title</label>
                  <input
                    type="text"
                    value={portfolio.title}
                    onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Hero Sub-Headline / Tagline</label>
                <input
                  type="text"
                  value={portfolio.tagline}
                  onChange={(e) => setPortfolio({ ...portfolio, tagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">About Me Narrative</label>
                <textarea
                  value={portfolio.about}
                  onChange={(e) => setPortfolio({ ...portfolio, about: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-900"
                />
              </div>

              {/* Resume Upload / Document Link Section */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-900 text-xs block">Download Resume Link / File</label>
                      <p className="text-[11px] text-slate-600">Upload a PDF/Word resume file or paste a Google Drive / cloud URL for your portfolio download button.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option 1: Paste Resume URL */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Paste Resume Link (Google Drive / Cloud PDF)</label>
                    <input
                      type="text"
                      value={portfolio.resumeUrl.startsWith('data:') ? '[Uploaded Resume File Embedded]' : portfolio.resumeUrl}
                      onChange={(e) => setPortfolio({ ...portfolio, resumeUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  {/* Option 2: Upload Resume File (.pdf, .doc, .docx) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Upload Resume Document (.pdf, .doc)</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>{portfolio.resumeUrl.startsWith('data:') ? 'Change Resume File' : 'Upload PDF File'}</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                      </label>
                      {portfolio.resumeUrl && portfolio.resumeUrl !== '#' && (
                        <button
                          onClick={() => setPortfolio(prev => ({ ...prev, resumeUrl: '#' }))}
                          className="px-3 py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl font-bold text-xs border border-slate-200 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">Email</label>
                  <input
                    type="email"
                    value={portfolio.email}
                    onChange={(e) => setPortfolio({ ...portfolio, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={portfolio.phone}
                    onChange={(e) => setPortfolio({ ...portfolio, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">Location</label>
                  <input
                    type="text"
                    value={portfolio.location}
                    onChange={(e) => setPortfolio({ ...portfolio, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Social Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">GitHub Profile</label>
                  <input
                    type="text"
                    value={portfolio.github}
                    onChange={(e) => setPortfolio({ ...portfolio, github: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={portfolio.linkedin}
                    onChange={(e) => setPortfolio({ ...portfolio, linkedin: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-900">Featured Projects List ({portfolio.projects.length})</h3>
                  <p className="text-[11px] text-slate-500">Manage interactive project showcase cards with GitHub and Live Demo links</p>
                </div>
                <button
                  onClick={handleAddProject}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {portfolio.projects.map((proj: ProjectItem, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900 text-xs">Project #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={proj.isFeatured}
                            onChange={(e) => handleUpdateProject(idx, 'isFeatured', e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Featured Badge</span>
                        </label>
                        <button
                          onClick={() => handleRemoveProject(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                        <input
                          type="text"
                          value={proj.image || ''}
                          onChange={(e) => handleUpdateProject(idx, 'image', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Project Description</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tech Stack (Comma-separated)</label>
                        <input
                          type="text"
                          value={(proj.techTags || []).join(', ')}
                          onChange={(e) => handleUpdateProject(idx, 'techTags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">GitHub Link</label>
                        <input
                          type="text"
                          value={proj.githubUrl}
                          onChange={(e) => handleUpdateProject(idx, 'githubUrl', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Live Demo Link</label>
                        <input
                          type="text"
                          value={proj.demoUrl}
                          onChange={(e) => handleUpdateProject(idx, 'demoUrl', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & TIMELINE */}
          {activeTab === 'experience_skills' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div>
                <label className="font-extrabold text-slate-900 block mb-1">Skills & Tech Stack (Comma-separated)</label>
                <textarea
                  value={portfolio.skills}
                  onChange={(e) => setPortfolio({ ...portfolio, skills: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Work History Timeline</h3>
                {(portfolio.experience || []).map((exp: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const nextExp = [...portfolio.experience];
                          nextExp[idx].role = e.target.value;
                          setPortfolio({ ...portfolio, experience: nextExp });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl font-bold"
                        placeholder="Role"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const nextExp = [...portfolio.experience];
                          nextExp[idx].company = e.target.value;
                          setPortfolio({ ...portfolio, experience: nextExp });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => {
                          const nextExp = [...portfolio.experience];
                          nextExp[idx].dates = e.target.value;
                          setPortfolio({ ...portfolio, experience: nextExp });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-700 font-bold"
                        placeholder="Dates"
                      />
                    </div>
                    <textarea
                      value={exp.bullets}
                      onChange={(e) => {
                        const nextExp = [...portfolio.experience];
                        nextExp[idx].bullets = e.target.value;
                        setPortfolio({ ...portfolio, experience: nextExp });
                      }}
                      rows={2}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl leading-relaxed"
                      placeholder="Bullet points"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STATS & ACHIEVEMENTS */}
          {activeTab === 'cert_stats' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-extrabold text-slate-900">Highlight Metric Counters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {portfolio.stats.map((st, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const nextStats = [...portfolio.stats];
                          nextStats[idx].value = e.target.value;
                          setPortfolio({ ...portfolio, stats: nextStats });
                        }}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-black text-emerald-700 text-center text-sm"
                      />
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const nextStats = [...portfolio.stats];
                          nextStats[idx].label = e.target.value;
                          setPortfolio({ ...portfolio, stats: nextStats });
                        }}
                        className="w-full p-1 bg-white border border-slate-200 rounded-lg font-bold text-center text-[10px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: THEMES & STYLES */}
          {activeTab === 'design' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Palette Accent Colors */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-slate-900 block">Accent Color Theme</label>
                <div className="flex flex-wrap gap-3">
                  {PALETTES.map(p => (
                    <button
                      key={p.name}
                      onClick={() => setPortfolio({ ...portfolio, accentColor: p.hex })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-transform active:scale-95 ${
                        portfolio.accentColor === p.hex ? 'border-slate-900 bg-white shadow-sm scale-105' : 'border-transparent bg-white/70'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: p.hex }} />
                      <span className="font-extrabold text-slate-800 text-[11px]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block text-xs">Portfolio Style Presets</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PORTFOLIO_STYLES.map(st => {
                    const Icon = st.icon;
                    const isSelected = portfolio.style === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setPortfolio({ ...portfolio, style: st.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">{st.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {publishedUrl ? (
              <span className="text-emerald-700 font-bold">✓ Published to temporary URL (Opened in new tab)</span>
            ) : (
              <span>Exports standalone self-contained HTML file</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-center"
            >
              Close
            </button>

            <button
              onClick={handlePublishPortfolio}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Publish & Open</span>
            </button>

            <button
              onClick={handleCopyHtml}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="truncate">{copied ? 'Copied HTML!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="truncate">Download HTML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
