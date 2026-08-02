// ============================================================
//  NovaResume AI — Shared TypeScript Interfaces
// ============================================================

export interface ExperienceItem {
  company: string;
  role: string;
  dates: string;
  location?: string;
  bullets: string; // newline-separated bullet points
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  tech?: string;
  link?: string;
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface ResumeData {
  // Personal
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  objective?: string;
  // Content arrays
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  customSections: CustomSection[];
  // Flat text sections
  skills: string;
  certifications?: string;
  languages?: string;
  achievements?: string;
  // Photo
  photoUrl?: string;
  showPhoto?: boolean;
  photoShape?: 'round' | 'square';
}

export type PaletteId =
  | 'navy_white'
  | 'forest_white'
  | 'emerald_white'
  | 'teal_white'
  | 'royal_blue_white'
  | 'slate_white'
  | 'burgundy_white'
  | 'charcoal_white'
  | 'gold_white'
  | 'purple_white'
  | 'custom';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  primary: string;   // sidebar / header bg
  accent: string;    // highlight color
  body: string;      // main body bg
  text: string;      // body text
  headerText: string;// text on primary bg
  border: string;    // divider / border
}

export const PALETTES: PaletteConfig[] = [
  { id: 'navy_white',    name: 'Navy Blue',    primary: '#1e3a8a', accent: '#3b82f6', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#e2e8f0' },
  { id: 'forest_white',  name: 'Forest Green', primary: '#14532d', accent: '#22c55e', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#e2e8f0' },
  { id: 'emerald_white', name: 'Emerald',      primary: '#065f46', accent: '#10b981', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#d1fae5' },
  { id: 'teal_white',    name: 'Teal',         primary: '#0f766e', accent: '#14b8a6', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#ccfbf1' },
  { id: 'royal_blue_white', name: 'Royal Blue', primary: '#1d4ed8', accent: '#60a5fa', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#dbeafe' },
  { id: 'slate_white',   name: 'Slate',        primary: '#334155', accent: '#64748b', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#e2e8f0' },
  { id: 'burgundy_white',name: 'Burgundy',     primary: '#9f1239', accent: '#e11d48', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#fce7f3' },
  { id: 'charcoal_white',name: 'Charcoal',     primary: '#1f2937', accent: '#6b7280', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#e5e7eb' },
  { id: 'gold_white',    name: 'Gold Brown',   primary: '#78350f', accent: '#d97706', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#fef3c7' },
  { id: 'purple_white',  name: 'Deep Purple',  primary: '#6b21a8', accent: '#a855f7', body: '#ffffff', text: '#0f172a', headerText: '#ffffff', border: '#f3e8ff' },
];

export type FontId = 'inter' | 'outfit' | 'dm_sans' | 'merriweather' | 'playfair' | 'roboto_mono';

export interface FontConfig {
  id: FontId;
  name: string;
  css: string;
  googleUrl: string;
}

export const FONTS: FontConfig[] = [
  { id: 'inter',       name: 'Inter',        css: "'Inter', sans-serif",       googleUrl: 'Inter:wght@400;500;600;700;800;900' },
  { id: 'outfit',      name: 'Outfit',       css: "'Outfit', sans-serif",      googleUrl: 'Outfit:wght@400;500;600;700;800' },
  { id: 'dm_sans',     name: 'DM Sans',      css: "'DM Sans', sans-serif",     googleUrl: 'DM+Sans:wght@400;500;600;700' },
  { id: 'merriweather',name: 'Merriweather', css: "'Merriweather', serif",     googleUrl: 'Merriweather:wght@400;700' },
  { id: 'playfair',    name: 'Playfair Display', css: "'Playfair Display', serif", googleUrl: 'Playfair+Display:wght@400;600;700' },
  { id: 'roboto_mono', name: 'Roboto Mono',  css: "'Roboto Mono', monospace",  googleUrl: 'Roboto+Mono:wght@400;500;700' },
];

export interface ThemeConfig {
  paletteId: PaletteId;
  palette: PaletteConfig;
  fontId: FontId;
  font: FontConfig;
  fontSize: number;        // 10–14
  lineHeight: number;      // 1.3–2.0
  sectionSpacing: number;  // 8–24px
  sidebarWidth: number;    // 28–38 (percent)
  layout: 'two_col_left' | 'two_col_right' | 'one_col' | 'top_header';
  // custom overrides
  customPrimary?: string;
  customAccent?: string;
}

export type LayoutType = 'two_col_left' | 'two_col_right' | 'one_col' | 'top_header';

// ── Template Registry ─────────────────────────────────────────

export type TemplateCategory =
  | 'Modern' | 'Executive' | 'ATS Professional' | 'Minimal' | 'Elegant'
  | 'Software Engineer' | 'AI Engineer' | 'Student' | 'Fresher'
  | 'Corporate' | 'Creative' | 'Academic' | 'Finance' | 'Healthcare'
  | 'Startup' | 'Portfolio' | 'Marketing' | 'Product Manager'
  | 'Data Scientist' | 'UI/UX Designer' | 'Sales';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  layout: LayoutType;
  rendererFamily: string;         // maps to a renderer component
  defaultPaletteId: PaletteId;
  defaultFontId: FontId;
  atsScore: number;               // 88–100
  pages: 1 | 2;
  isPopular?: boolean;
  isNew?: boolean;
  description: string;
  tags: string[];
}
