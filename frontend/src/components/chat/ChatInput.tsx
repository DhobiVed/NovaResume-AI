import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Send, Square, Paperclip, X, Sparkles, FileText } from 'lucide-react';

export const ChatInput: React.FC = () => {
  const { sendMessage, isGenerating, stopGeneration, attachments, uploadFileAttachment, deleteFileAttachment } = useChat();
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptTemplates = [
    { title: 'Summarize Document', prompt: 'Summarize the attached document with key bullet points, main conclusions, and actionable takeaways.' },
    { title: 'Explain Code', prompt: 'Explain the following code step by step, highlighting performance and edge cases:' },
    { title: 'Draft Resume', prompt: 'Help me draft a professional resume tailored for a Senior AI Software Engineer role.' },
    { title: 'Analyze Table Data', prompt: 'Analyze the attached spreadsheet dataset, summarize key metrics, and extract main statistical insights.' }
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isGenerating) return;
    sendMessage(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => uploadFileAttachment(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => uploadFileAttachment(file));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 border-t border-slate-200/80 dark:border-slate-800/80 glass-panel relative ${isDragging ? 'bg-primary/10 border-primary border-dashed border-2' : ''}`}
    >
      {/* Prompt templates dropdown modal */}
      {showTemplates && (
        <div className="absolute bottom-full mb-2 left-4 right-4 md:left-8 md:right-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl z-20 grid grid-cols-1 md:grid-cols-2 gap-2">
          {promptTemplates.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(item.prompt);
                setShowTemplates(false);
              }}
              className="text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="font-semibold text-xs text-primary">{item.title}</div>
              <div className="text-xs text-slate-500 truncate">{item.prompt}</div>
            </button>
          ))}
        </div>
      )}

      {/* File attachment badges */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[150px]">{att.filename}</span>
              <button
                onClick={() => deleteFileAttachment(att.id)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title="Upload File (PDF, DOCX, CSV, Image, ZIP)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.zip"
        />

        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 transition-colors"
          title="Prompt Templates"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask NovaChat AI anything... (Shift+Enter for new line)"
          rows={1}
          className="flex-1 bg-transparent border border-slate-300 dark:border-slate-700/70 rounded-2xl px-4 py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-48 text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />

        {isGenerating ? (
          <button
            type="button"
            onClick={stopGeneration}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center"
            title="Stop Generation"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
