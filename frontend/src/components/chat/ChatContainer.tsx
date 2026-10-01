import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { Bot, FileText, Code, Zap, ShieldCheck } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const { messages, isGenerating, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { icon: <FileText className="w-5 h-5 text-blue-500" />, title: 'Analyze PDF & Documents', prompt: 'Summarize the attached document and answer key questions.' },
    { icon: <Code className="w-5 h-5 text-purple-500" />, title: 'Code Review & Refactor', prompt: 'Help me review code architecture, optimize algorithms, and fix performance bottlenecks.' },
    { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Generate PDF Report', prompt: 'Create a detailed market research report on Generative AI trends.' },
    { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: 'Memory & Long Context', prompt: 'What long-term user preferences do you have saved about me?' }
  ];

  const lastMsg = messages[messages.length - 1];
  const isWaitingForToken = isGenerating && lastMsg && lastMsg.role === 'assistant' && !lastMsg.content;

  return (
    <div className="flex-1 overflow-y-auto relative flex flex-col">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center text-white shadow-md mb-4">
            <Bot className="w-6 h-6" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            NovaChat AI Platform
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm max-w-lg mb-6">
            Enterprise AI powered by high-speed inference, vector search, structured document generation, and multi-disciplinary career intelligence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q.prompt)}
                className="flex items-start gap-3 p-3.5 rounded-2xl glass-card-interactive text-left shadow-xs group cursor-pointer"
              >
                <div className="p-2 rounded-xl glass-pill shrink-0">
                  {q.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{q.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{q.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-4">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              isLastAssistant={idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          {isWaitingForToken && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
