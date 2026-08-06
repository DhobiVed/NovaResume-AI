import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, FileText, Download } from 'lucide-react';

interface DocGenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocGenModal: React.FC<DocGenModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('Quarterly AI Performance Report');
  const [docType, setDocType] = useState('report');
  const [format, setFormat] = useState('pdf');
  const [content, setContent] = useState(
    '1. Executive Summary\nGenerative AI adoption increased by 140% this quarter.\n\n2. Key Achievements\n- Built NovaChat AI platform with FastAPI & React.\n- Integrated Groq LLM streaming token generation.\n- Built RAG document retrieval system.'
  );

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.generateDocument(title, docType, format, content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl w-full max-w-xl shadow-2xl p-4 sm:p-6 relative flex flex-col h-full sm:h-auto overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100">Document Generator Engine</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Template Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="report">Business Report</option>
                <option value="resume">Resume / CV</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="presentation">Presentation Outline</option>
                <option value="notes">Lecture / Meeting Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Export Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="docx">Microsoft Word (.docx)</option>
                <option value="md">Markdown File (.md)</option>
                <option value="txt">Plain Text (.txt)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Document Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Generate & Download</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
