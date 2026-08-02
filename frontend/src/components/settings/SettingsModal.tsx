import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { api } from '../../services/api';
import { Settings, X, Key, Terminal, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { systemPrompt, setSystemPrompt } = useChat();
  const [apiKey, setApiKey] = useState('');
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      await api.updateApiKey(apiKey.trim());
      setSavedKeyMsg(true);
      setTimeout(() => setSavedKeyMsg(false), 2500);
      setApiKey('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">NovaChat AI Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Custom System Prompt */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <Terminal className="w-4 h-4 text-primary" />
              <span>Global System Prompt</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Defines the core personality, guidelines, and behavioral boundaries for NovaChat AI.
            </p>
          </div>

          {/* Groq API Key Config */}
          <form onSubmit={handleSaveApiKey} className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Custom Groq API Key</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                {savedKeyMsg ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedKeyMsg ? 'Saved' : 'Update'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to use default built-in server API key.
            </p>
          </form>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
