import React, { useState } from 'react';
import { X, Check, Sparkles, Layout } from 'lucide-react';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '../../lib/templateData';
import type { TemplateDefinition } from '../../lib/resumeTypes';

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
  parsedData: any;
}

export const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  parsedData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplateState] = useState<TemplateDefinition>(ALL_TEMPLATES[0]);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'All'
    ? ALL_TEMPLATES
    : ALL_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleConfirm = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Select Resume Template</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Step 2 of 2
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Choose how your extracted resume details for <strong className="text-slate-800">{parsedData?.fullName || 'Candidate'}</strong> will look.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Pill Scroller */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer min-h-[38px] ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((t) => {
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplateState(t)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-xl ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10 shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                      {t.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                      ATS {t.atsScore}%
                    </span>
                    <span>{t.layout.replace('_', ' ')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full mt-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected ✓' : 'Select Template'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500">
            Selected: <strong className="text-slate-900">{selectedTemplate.name}</strong> ({selectedTemplate.category})
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2 min-h-[44px]"
            >
              <span>Apply Template & Open Editor</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
