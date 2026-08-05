import React, { useState } from 'react';
import {
  X, Upload, FileText, Sparkles, Check
} from 'lucide-react';
import mammoth from 'mammoth';
import { API_BASE } from '../../config';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (parsedData: any) => void;
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

  if (!isOpen) return null;

  // Sanitize Extracted Text to remove binary ZIP artifacts, XML tags, and non-printable noise
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    cleaned = cleaned.replace(/PK[\s\S]*?\[Content_Types\]\.xml/gi, '');
    cleaned = cleaned.replace(/_rels\/\.rels/gi, '');
    cleaned = cleaned.replace(/word\/[a-zA-Z0-9_\-\./]+/gi, '');
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
    cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return cleaned;
  };

  // Perform Client-Side Extraction with Guaranteed Clean Fields
  const fallbackExtractText = (rawContent: string, filename: string) => {
    const text = sanitizeText(rawContent);

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Extract name from filename or clean line
    let candidateName = '';
    const cleanFilename = filename.replace(/\.(docx?|pdf|txt|md|json)$/gi, '').replace(/[_-]/g, ' ').trim();
    if (cleanFilename && !cleanFilename.toLowerCase().includes('resume') && !cleanFilename.toLowerCase().includes('biodata')) {
      candidateName = cleanFilename;
    } else {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.match(/\d{4}/) && !line.startsWith('PK')) {
          candidateName = line.replace(/[^a-zA-Z\s]/g, '').trim();
          if (candidateName) break;
        }
      }
    }

    // Extract summary lines (first 300 clean characters)
    const cleanSummary = text.slice(0, 300).trim();

    return {
      fullName: candidateName || 'Imported Candidate',
      title: 'Professional',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      summary: cleanSummary || 'Imported resume details.',
      skills: 'Communication, Project Management, Technical Skills',
      experience: [],
      education: []
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
          // Ensure no raw binary string passed into summary
          data.parsed.summary = sanitizeText(data.parsed.summary || '');
          setParsedPreview(data.parsed);
          setIsParsing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend parse-file offline, using clean client-side extraction:', err);
    }

    // 3. Client-Side Fallback with Text Sanitization
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const cleanContent = sanitizeText(content);
      setRawText(cleanContent);
      const extracted = fallbackExtractText(cleanContent, file.name);
      setParsedPreview(extracted);
      setIsParsing(false);
    };

    if (file.name.endsWith('.json') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
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

  const handleConfirmImport = () => {
    if (parsedPreview) {
      onImportComplete(parsedPreview);
      onClose();
    }
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
            <span>Confirm & Open in Resume Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
