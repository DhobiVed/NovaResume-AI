import React, { useState } from 'react';
import type { Message } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CitationBadge } from './CitationBadge';
import { useChat } from '../../context/ChatContext';
import { Bot, User, Copy, Check, RotateCcw, Play } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLastAssistant?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastAssistant }) => {
  const { regenerateLastResponse, sendMessage } = useChat();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    sendMessage("Continue response from where you left off...");
  };

  return (
    <div className={`flex gap-3 md:gap-4 p-4 md:p-6 transition-all ${
      isUser
        ? 'bg-transparent'
        : 'bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/40 shadow-sm'
    }`}>
      {/* Avatar Icon */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">
              {isUser ? 'You' : 'NovaChat AI'}
            </span>
            {message.isStreaming && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary animate-pulse">
                Generating...
              </span>
            )}
          </div>

          {!message.isStreaming && (
            <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {!isUser && isLastAssistant && (
                <>
                  <button
                    onClick={handleContinue}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                    title="Continue generation"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-blue-500" />
                    <span className="hidden sm:inline">Continue</span>
                  </button>

                  <button
                    onClick={regenerateLastResponse}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Text with blinking cursor typing effect when streaming */}
        <div className={message.isStreaming ? 'typing-cursor font-normal' : ''}>
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : message.isStreaming ? (
            <div className="flex items-center gap-1.5 py-1 text-slate-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span>Thinking...</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">No response</span>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <CitationBadge citations={message.sources} />
        )}
      </div>
    </div>
  );
};
