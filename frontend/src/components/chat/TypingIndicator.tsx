import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 md:p-5 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/40 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5 font-mono">NovaChat is thinking...</span>
      </div>
    </div>
  );
};
