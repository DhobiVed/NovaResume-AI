import React, { useState } from 'react';
import type { Citation } from '../../types';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface CitationBadgeProps {
  citations: Citation[];
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citations }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-primary/10 px-2.5 py-1 rounded-full transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{citations.length} Document Source{citations.length > 1 ? 's' : ''} Cited</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {citations.map((c) => (
            <div
              key={c.id}
              className="p-2.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60"
            >
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>📄 {c.doc_name}</span>
                <span className="text-primary">Page {c.page_num}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic font-mono text-[11px]">
                "{c.snippet}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
