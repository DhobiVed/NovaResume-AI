import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles } from 'lucide-react';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (parsedData: any) => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/resumes/parse-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText })
      });
      const data = await res.json();
      if (data.parsed) {
        onImportComplete(data.parsed);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRawText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Import Resume / LinkedIn Data</h2>
              <p className="text-xs text-slate-400">Paste raw text or upload TXT/PDF/JSON to populate NovaResume Studio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-2">
            <FileText className="w-8 h-8 text-primary mx-auto" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Resume File (.txt, .json)</div>
            <label className="inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer">
              Choose File
              <input type="file" accept=".txt,.json,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste Resume Text / LinkedIn About Details
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw text here..."
              rows={8}
              className="w-full p-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={isParsing || !rawText.trim()}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isParsing ? 'Parsing with AI...' : 'Extract & Open in Editor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
