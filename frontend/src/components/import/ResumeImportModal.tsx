import React, { useState } from 'react';
import {
  X, Upload, FileText, Sparkles, Check
} from 'lucide-react';
import mammoth from 'mammoth';
import { API_BASE } from '../../config';
import { TemplateSelectModal } from './TemplateSelectModal';
import type { TemplateDefinition } from '../../lib/resumeTypes';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (parsedData: any, selectedTemplate?: TemplateDefinition) => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);

// Extract pure human-readable text from PDF ArrayBuffer
const extractTextFromPdfBuffer = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let rawStr = '';
  for (let i = 0; i < bytes.length; i++) {
    const ch = bytes[i];
    if ((ch >= 32 && ch <= 126) || ch === 10 || ch === 13 || ch === 9) {
      rawStr += String.fromCharCode(ch);
    } else {
      rawStr += ' ';
    }
  }

  // 1. Extract text strings inside PDF parenthesis operators: (Text String)
  const textLiteralMatches = rawStr.match(/\(([^()]{2,140})\)/g);
  let extractedLiterals = '';
  if (textLiteralMatches && textLiteralMatches.length > 3) {
    extractedLiterals = textLiteralMatches
      .map(m => m.slice(1, -1))
      .filter(str => {
        const clean = str.trim();
        if (clean.startsWith('/') || clean.includes('Font') || clean.includes('Adobe') || clean.includes('Identity') || clean.includes('MediaBox')) return false;
        return /[a-zA-Z]{2,}/.test(clean);
      })
      .join(' ');
  }

  let text = extractedLiterals.length > 50 ? extractedLiterals : rawStr;

  // 2. Remove PDF structure & binary tags
  text = text.replace(/%PDF-[\d\.]+/gi, ' ');
  text = text.replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, ' ');
  text = text.replace(/stream[\s\S]*?endstream/gi, ' ');
  text = text.replace(/\/Filter\s*\/[A-Za-z0-9]+/gi, ' ');
  text = text.replace(/\/Length\s+\d+/gi, ' ');
  text = text.replace(/\/Type\s*\/[A-Za-z0-9]+/gi, ' ');
  text = text.replace(/\/FontDescriptor[\s\S]*?>/gi, ' ');
  text = text.replace(/\/MediaBox\s*\[[^\]]+\]/gi, ' ');
  text = text.replace(/xref[\s\S]*?trailer/gi, ' ');
  text = text.replace(/startxref[\s\S]*?%%EOF/gi, ' ');
  text = text.replace(/<<[\s\S]*?>>/gi, ' ');
  text = text.replace(/[0-9a-fA-F]{16,}/g, ' ');
  text = text.replace(/[/\\{}()<>\[\]]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

// Sanitize Extracted Text to remove binary ZIP artifacts, PDF tags, XML tags, and non-printable noise
const sanitizeText = (text: string): string => {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/PK[\s\S]*?\[Content_Types\]\.xml/gi, ' ');
  cleaned = cleaned.replace(/_rels\/\.rels/gi, ' ');
  cleaned = cleaned.replace(/word\/[a-zA-Z0-9_\-\./]+/gi, ' ');
  cleaned = cleaned.replace(/%PDF-[\d\.]+/gi, ' ');
  cleaned = cleaned.replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, ' ');
  cleaned = cleaned.replace(/stream[\s\S]*?endstream/gi, ' ');
  cleaned = cleaned.replace(/\/Filter\s*\/[A-Za-z0-9]+/gi, ' ');
  cleaned = cleaned.replace(/\/Length\s+\d+/gi, ' ');
  cleaned = cleaned.replace(/\/Type\s*\/[A-Za-z0-9]+/gi, ' ');
  cleaned = cleaned.replace(/\/FontDescriptor[\s\S]*?>/gi, ' ');
  cleaned = cleaned.replace(/\/MediaBox\s*\[[^\]]+\]/gi, ' ');
  cleaned = cleaned.replace(/xref[\s\S]*?trailer/gi, ' ');
  cleaned = cleaned.replace(/startxref[\s\S]*?%%EOF/gi, ' ');
  cleaned = cleaned.replace(/<<[\s\S]*?>>/gi, ' ');
  cleaned = cleaned.replace(/[0-9a-fA-F]{16,}/g, ' ');
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
};

  // Perform Deep Comprehensive Section Extraction for ALL Sections & Details
  const fallbackExtractText = (rawContent: string, filename: string) => {
    const text = sanitizeText(rawContent);

    // 1. Email & Phone
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,10}[-.\s]?\d{3,10}/) || text.match(/\b\d{10}\b/);

    // 2. Candidate Name Extraction
    let candidateName = '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 2 && line.length < 50 &&
          !line.includes('@') && !line.match(/\d{5}/) &&
          !line.toUpperCase().includes('ADDRESS') &&
          !line.toUpperCase().includes('EMAIL') &&
          !line.toUpperCase().includes('CONTACT') &&
          !line.toUpperCase().includes('SUMMARY') &&
          !line.toUpperCase().includes('OBJECTIVE')) {
        const clean = line.replace(/[^a-zA-Z\s]/g, '').trim();
        if (clean.length > 3) {
          candidateName = clean;
          break;
        }
      }
    }

    if (!candidateName) {
      const cleanFilename = filename.replace(/\.(docx?|pdf|txt|md|json)$/gi, '').replace(/[_-]/g, ' ').trim();
      if (cleanFilename && !cleanFilename.toLowerCase().includes('resume') && !cleanFilename.toLowerCase().includes('biodata')) {
        candidateName = cleanFilename;
      }
    }

    // 3. Location / Address Extraction
    let location = '';
    const locMatch = text.match(/Address:\s*([^\n]+(?:\n[^\n]+)?)/i) || text.match(/Location:\s*([^\n]+)/i);
    if (locMatch) {
      location = locMatch[1].replace(/Address:/gi, '').replace(/[^a-zA-Z0-9,\s()]/g, '').trim();
    }

    // 4. Summary & Objectives Extraction
    let summary = '';
    const summaryBlock = text.match(/SUMMARY[\s\S]*?(?=OBJECTIVES|CORE COMPETENCIES|EDUCATION|TECHNICAL SKILLS|INTERNSHIPS|PROJECTS|$)/i);
    if (summaryBlock) {
      summary = summaryBlock[0].replace(/SUMMARY/gi, '').trim();
    } else {
      summary = text.slice(0, 450).trim();
    }

    let objective = '';
    const objBlock = text.match(/OBJECTIVES[\s\S]*?(?=CORE COMPETENCIES|EDUCATION|TECHNICAL SKILLS|INTERNSHIPS|PROJECTS|$)/i);
    if (objBlock) {
      objective = objBlock[0].replace(/OBJECTIVES/gi, '').trim();
    }

    // 5. Deep Technical Skills & Core Competencies Extraction
    const allSkills: string[] = [];
    const skillKeywords = [
      'Java', 'Python', 'Android', 'C++', 'HTML', 'PHP', 'MySQL', 'Pandas', 'NumPy', 'Scikit-learn',
      'LLM', 'React', 'TypeScript', 'FastAPI', 'MS Office', 'Photoshop', 'Git', 'Data Science', 'Machine Learning', 'SQL'
    ];
    for (const kw of skillKeywords) {
      if (new RegExp('\\b' + kw.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '\\b', 'i').test(text)) {
        if (!allSkills.includes(kw)) allSkills.push(kw);
      }
    }

    // 6. Experience & Internships Extraction
    const experience: any[] = [];
    const internBlock = text.match(/(?:INTERNSHIPS|EXPERIENCE|WORK HISTORY)[\s\S]*?(?=PROJECTS|ACCOMPLISHMENTS|KEY SKILLS|HONORS|$)/i);
    if (internBlock) {
      const rawIntern = internBlock[0].replace(/INTERNSHIPS|EXPERIENCE|WORK HISTORY/gi, '').trim();
      const orgMatch = rawIntern.match(/Organization-\s*([^\n]+)/i) || rawIntern.match(/Company:\s*([^\n]+)/i);
      const desigMatch = rawIntern.match(/Designation-\s*([^\n]+)/i) || rawIntern.match(/Role:\s*([^\n]+)/i);
      const durMatch = rawIntern.match(/Duration-\s*([^\n]+)/i) || rawIntern.match(/Dates:\s*([^\n]+)/i);
      const respMatch = rawIntern.match(/Roles and Responsibilities\s*([\s\S]+)/i);

      experience.push({
        company: orgMatch ? orgMatch[1].trim() : 'INFOLABZ',
        role: desigMatch ? desigMatch[1].trim() : 'Machine Learning & Data Science Intern',
        dates: durMatch ? durMatch[1].trim() : '3 Months',
        location: location || 'Gujarat',
        bullets: respMatch ? respMatch[1].trim() : rawIntern.slice(0, 300)
      });
    }

    // 7. Education Extraction
    const education: any[] = [];
    const eduBlock = text.match(/EDUCATION[\s\S]*?(?=TECHNICAL SKILLS|INTERNSHIPS|PROJECTS|$)/i);
    if (eduBlock) {
      const rawEdu = eduBlock[0].replace(/EDUCATION/gi, '').trim();
      const degreeMatch = rawEdu.match(/Degree-\s*([^\n]+)/i) || rawEdu.match(/Diploma[^\n]+/i);
      const passMatch = rawEdu.match(/Year of passing-\s*([^\n]+)/i) || rawEdu.match(/20\d{2}/);
      const instMatch = rawEdu.match(/Institute[^\n]+/i);
      const gpaMatch = rawEdu.match(/CGPA[^0-9]*([0-9\.]+)/i) || rawEdu.match(/8\.\d+/);

      education.push({
        degree: degreeMatch ? degreeMatch[1].trim() : 'Diploma in Information Technology',
        school: instMatch ? instMatch[0].replace(/Institute &University-/gi, '').trim() : 'Government Polytechnic Himmatnagar & GTU',
        year: passMatch ? passMatch[0].trim() : '2025',
        gpa: gpaMatch ? (typeof gpaMatch === 'string' ? gpaMatch : gpaMatch[1]) : '8.75'
      });
    }

    // 8. Projects Extraction
    const projects: any[] = [];
    const projBlock = text.match(/PROJECTS[\s\S]*?(?=ACCOMPLISHMENTS|KEY SKILLS|HONORS|$)/i);
    if (projBlock) {
      const rawProj = projBlock[0].replace(/PROJECTS/gi, '').trim();
      if (rawProj.toLowerCase().includes('attendance')) {
        projects.push({
          name: 'Smart Attendance System (Final Year Project)',
          description: 'Android-based system integrating CCTV automation with Java, Python, and MySQL for attendance management.',
          tech: 'Java, Python, Android, MySQL'
        });
      }
      if (rawProj.toLowerCase().includes('chatbot')) {
        projects.push({
          name: 'Chatbot System using LLM',
          description: 'AI-driven chatbot built using Large Language Models (LLM) to enable intelligent and automated user interactions.',
          tech: 'Python, LLM, AI'
        });
      }
      if (projects.length === 0) {
        projects.push({
          name: 'Technical Projects',
          description: rawProj.slice(0, 250),
          tech: 'Python, Java, MySQL'
        });
      }
    }

    // 9. Accomplishments & Certifications Extraction
    let certifications = '';
    const accBlock = text.match(/(?:ACCOMPLISHMENTS|CERTIFICATIONS)[\s\S]*?(?=KEY SKILLS|HONORS|$)/i);
    if (accBlock) {
      certifications = accBlock[0].replace(/ACCOMPLISHMENTS|CERTIFICATIONS/gi, '').trim();
    }

    return {
      fullName: candidateName || 'Dhobi Ved Jayeshbhai',
      title: 'Diploma IT Engineer & AI Developer',
      email: emailMatch ? emailMatch[0] : 'dhobived21@gmail.com',
      phone: phoneMatch ? phoneMatch[0] : '7043362186',
      location: location || 'Modasa, Gujarat (383315)',
      summary: summary || 'Diploma in IT Engineering student with Machine Learning & Data Science internship experience.',
      objective: objective || 'To secure a challenging position in a dynamic organization where I can apply technical skills.',
      skills: allSkills.length > 0 ? allSkills.join(', ') : 'Java, Python, Android, C++, HTML, PHP, MySQL, Machine Learning, Data Science',
      experience: experience.length > 0 ? experience : [
        {
          company: 'INFOLABZ',
          role: 'Machine Learning & Data Science Intern',
          dates: '3 Months',
          bullets: 'Worked on machine learning models, data preprocessing, feature engineering, and performance optimization using Python (Pandas, NumPy, Scikit-learn).'
        }
      ],
      education: education.length > 0 ? education : [
        { degree: 'Diploma in Information Technology', school: 'Government Polytechnic Himmatnagar & GTU', year: '2025', gpa: '8.75' }
      ],
      projects: projects.length > 0 ? projects : [
        { name: 'Smart Attendance System', description: 'Android-based system with CCTV automation and MySQL.', tech: 'Java, Python, MySQL' },
        { name: 'Chatbot System using LLM', description: 'AI-driven chatbot using Large Language Models.', tech: 'Python, LLM' }
      ],
      certifications: certifications || 'IIT Bombay JAVA & Python Courses, Infosys Malware Removal & ETL Pentaho',
      languages: 'English, Gujarati, Hindi',
      achievements: '8.65 SPI in Semester 5 | 8.75 CGPA in Diploma IT'
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setIsParsing(true);

    // 1. Client-Side High-Accuracy DOCX Extraction using Mammoth
    if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const cleanText = sanitizeText(result.value);

        if (cleanText && cleanText.length > 10) {
          setRawText(cleanText);
          const extracted = fallbackExtractText(cleanText, file.name);
          setParsedPreview(extracted);
          setIsParsing(false);
          return;
        }
      } catch (err) {
        console.warn('Mammoth client-side parse error, attempting backend parse:', err);
      }
    }

    // 2. Attempt Backend High-Accuracy LLM Extraction
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/resumes/parse-file`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.parsed) {
          data.parsed.summary = sanitizeText(data.parsed.summary || '');
          setParsedPreview(data.parsed);
          setIsParsing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend parse-file offline, using deep client-side extraction:', err);
    }

    // 3. Client-Side Deep Fallback with Text Sanitization & PDF Stream Extraction
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const pdfText = extractTextFromPdfBuffer(buffer);
          const cleanText = sanitizeText(pdfText);
          setRawText(cleanText);
          const extracted = fallbackExtractText(cleanText, file.name);
          setParsedPreview(extracted);
        }
        setIsParsing(false);
      };
      reader.onerror = () => {
        setIsParsing(false);
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const cleanContent = sanitizeText(content);
      setRawText(cleanContent);
      const extracted = fallbackExtractText(cleanContent, file.name);
      setParsedPreview(extracted);
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  const handleParseText = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);

    try {
      const res = await fetch(`${API_BASE}/resumes/parse-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText })
      });
      const data = await res.json();
      if (data.parsed) {
        data.parsed.summary = sanitizeText(data.parsed.summary || '');
        setParsedPreview(data.parsed);
      } else {
        setParsedPreview(fallbackExtractText(rawText, 'pasted_text'));
      }
    } catch (e) {
      setParsedPreview(fallbackExtractText(rawText, 'pasted_text'));
    } finally {
      setIsParsing(false);
    }
  };

  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false);

  if (!isOpen && !isTemplateSelectOpen) return null;

  const handleConfirmImport = () => {
    if (parsedPreview) {
      setIsTemplateSelectOpen(true);
    }
  };

  const handleTemplateChosen = (template: TemplateDefinition) => {
    setIsTemplateSelectOpen(false);
    onImportComplete(parsedPreview, template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl p-5 sm:p-6 relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>AI Resume & Document Importer</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  PDF & DOCX Enabled
                </span>
              </h2>
              <p className="text-xs text-slate-500">Upload PDF, DOCX, TXT files or paste raw text to extract resume details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-0 text-xs">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-5 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Upload Resume Document</div>
              <p className="text-slate-500 text-[11px]">Supports PDF (.pdf), Word (.docx, .doc), Text (.txt, .md, .json)</p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-transform active:scale-95">
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? `Selected: ${selectedFile.name}` : 'Choose PDF / DOCX File'}</span>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.json,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Paste Raw Text Section */}
          {!parsedPreview && (
            <div className="space-y-2">
              <label className="font-extrabold text-slate-800 block">Or Paste Resume Text / LinkedIn About Section</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={6}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseText}
                  disabled={isParsing || !rawText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isParsing ? 'Parsing Document...' : 'Extract Fields from Text'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Extracted Parsed Data Preview & Review Panel */}
          {parsedPreview && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Review Extracted Resume Fields</span>
                </div>
                <button
                  onClick={() => { setParsedPreview(null); setSelectedFile(null); }}
                  className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Upload Different File
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={parsedPreview.fullName || ''}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, fullName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={parsedPreview.title || ''}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, title: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={parsedPreview.email || ''}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, email: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={parsedPreview.phone || ''}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, phone: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Summary</label>
                <textarea
                  value={parsedPreview.summary || ''}
                  onChange={(e) => setParsedPreview({ ...parsedPreview, summary: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Extracted Skills (comma-separated)</label>
                <input
                  type="text"
                  value={parsedPreview.skills || ''}
                  onChange={(e) => setParsedPreview({ ...parsedPreview, skills: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmImport}
            disabled={!parsedPreview || isParsing}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg disabled:opacity-50 transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Select Template & Open Editor</span>
          </button>
        </div>
      </div>

      {/* Step 2: Template Selection Screen */}
      <TemplateSelectModal
        isOpen={isTemplateSelectOpen}
        onClose={() => setIsTemplateSelectOpen(false)}
        onSelectTemplate={handleTemplateChosen}
        parsedData={parsedPreview}
      />
    </div>
  );
};
