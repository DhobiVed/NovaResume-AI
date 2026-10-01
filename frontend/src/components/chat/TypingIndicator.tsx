import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shadow-xs">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse"></span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1.5 font-mono">Processing...</span>
      </div>
    </div>
  );
};
