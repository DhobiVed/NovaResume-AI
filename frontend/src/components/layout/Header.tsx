import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Sun, Moon, Cpu, Download, Settings, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettingsModal }) => {
  const { currentConversation, selectedModel, setSelectedModel, availableModels } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleExport = (format: string) => {
    if (currentConversation?.id) {
      api.exportConversation(currentConversation.id, format);
      setShowExportMenu(false);
    }
  };

  const activeModelObj = availableModels.find((m) => m.id === selectedModel);

  return (
    <header className="h-14 px-4 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between z-10">
      {/* Active Conversation Title */}
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <h1 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-100 truncate max-w-xs md:max-w-md">
          {currentConversation?.title || 'New Chat'}
        </h1>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">{activeModelObj?.name || selectedModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showModelMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-30 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Select LLM Model
              </div>
              {availableModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    setShowModelMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                    selectedModel === m.id
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{m.name}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{m.provider}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">{m.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Chat Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Export Conversation"
          >
            <Download className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 text-xs font-medium">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('docx')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
              >
                Export as DOCX
              </button>
              <button
                onClick={() => handleExport('md')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
              >
                Export as Markdown
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
              >
                Export as JSON
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* System Settings Trigger */}
        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="System Settings & System Prompt"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
