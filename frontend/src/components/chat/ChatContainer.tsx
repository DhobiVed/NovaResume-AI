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
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl mb-6 animate-pulse-subtle">
            <Bot className="w-9 h-9" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent mb-3">
            NovaChat AI Platform
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg mb-8">
            Experience next-generation AI powered by Groq LLM engines, RAG vector document search, document generation, and real-time streaming token reasoning.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q.prompt)}
                className="flex items-start gap-3 p-4 rounded-2xl glass-panel hover:border-primary/50 text-left transition-all hover:scale-[1.01] group"
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                  {q.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{q.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{q.prompt}</p>
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
