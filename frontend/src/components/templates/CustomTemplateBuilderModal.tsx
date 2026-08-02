import React, { useState } from 'react';
import { X, Palette, Save } from 'lucide-react';

interface CustomTemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomTemplate: (templateData: any) => void;
}

export const CustomTemplateBuilderModal: React.FC<CustomTemplateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomTemplate
}) => {
  const [templateName, setTemplateName] = useState('My Custom Canva Template');
  const [category, setCategory] = useState('Software Engineer');
  const [layout, setLayout] = useState<'one_column' | 'two_column'>('two_column');
  const [themeBg, setThemeBg] = useState('#0f172a');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [cardBg, setCardBg] = useState('#f8fafc');
  const [textColor, setTextColor] = useState('#0f172a');

  if (!isOpen) return null;

  const handleSave = () => {
    const customTemplate = {
      id: `custom_${Date.now()}`,
      name: templateName,
      category,
      layout,
      atsScore: 98,
      isNew: true,
      themeColor: themeBg,
      accentColor,
      cardBg,
      textColor,
      previewDescription: 'User-designed custom graphic resume layout.'
    };
    onSaveCustomTemplate(customTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Custom Template Studio</h2>
              <p className="text-xs text-slate-400">Design your custom graphic canvas layout and save to personal library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-semibold"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Executive">Executive</option>
                <option value="Creative">Creative</option>
                <option value="Modern">Modern</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Layout Structure</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-semibold"
              >
                <option value="two_column">2-Column Graphic Sidebar</option>
                <option value="one_column">1-Column ATS Classic</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Custom Color Palette</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block">Header / Sidebar BG</label>
                <input
                  type="color"
                  value={themeBg}
                  onChange={(e) => setThemeBg(e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Accent Color</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Card Background</label>
                <input
                  type="color"
                  value={cardBg}
                  onChange={(e) => setCardBg(e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Body Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
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
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Custom Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
