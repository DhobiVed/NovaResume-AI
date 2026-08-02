import React, { useState, useEffect } from 'react';
import type { UserMemory } from '../../types';
import { api } from '../../services/api';
import { Brain, X, Plus, Pin, Trash2 } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  const loadMemories = async () => {
    const data = await api.getMemories();
    setMemories(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    await api.addMemory(key.trim(), value.trim(), 'user_pref', isPinned);
    setKey('');
    setValue('');
    setIsPinned(false);
    loadMemories();
  };

  const handleDelete = async (id: string) => {
    await api.deleteMemory(id);
    loadMemories();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">User Memory Manager</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          NovaChat AI automatically retains important user preferences, background facts, and guidelines across conversations.
        </p>

        {/* Add Memory Form */}
        <form onSubmit={handleAdd} className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Memory Key (e.g. Preferred Language)"
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Memory Value (e.g. Python & TypeScript)"
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Pin Memory Fact</span>
            </label>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          </div>
        </form>

        {/* Saved Memories List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
          {memories.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No long-term memories saved yet</div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    {m.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    <span>{m.key}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 truncate mt-0.5">{m.value}</div>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
