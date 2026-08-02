import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Plus, MessageSquare, Pin, Folder as FolderIcon, Search,
  Trash2, Edit3, Brain, FileText, User, X
} from 'lucide-react';

interface SidebarProps {
  onOpenMemoryModal: () => void;
  onOpenDocGenModal: () => void;
  onOpenResumeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenMemoryModal, onOpenDocGenModal, onOpenResumeModal }) => {
  const {
    conversations,
    folders,
    currentConversation,
    activeFolderId,
    searchQuery,
    setSearchQuery,
    setActiveFolderId,
    createNewChat,
    selectConversation,
    deleteChat,
    renameChat,
    togglePinChat,
    createFolder
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  return (
    <aside className="w-72 md:w-80 h-full flex flex-col glass-panel border-r border-slate-200/80 dark:border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            N
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              NovaChat AI
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">v1.0 Pro</p>
          </div>
        </div>

        <button
          onClick={() => createNewChat()}
          className="p-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1 text-xs font-semibold"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="px-3 pb-2 flex gap-1.5">
        <button
          onClick={onOpenResumeModal}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          title="Guided ATS Resume Builder"
        >
          <User className="w-3.5 h-3.5 text-purple-500" />
          <span>Resume</span>
        </button>
        <button
          onClick={onOpenDocGenModal}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <span>Doc Gen</span>
        </button>
        <button
          onClick={onOpenMemoryModal}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-indigo-500" />
          <span>Memory</span>
        </button>
      </div>

      {/* Folders Bar */}
      <div className="px-3 py-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folders</span>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="text-xs text-primary hover:underline font-semibold"
          >
            + Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveFolderId(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeFolderId === null
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFolderId(f.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeFolderId === f.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <FolderIcon className="w-3 h-3" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">No chats found</div>
        ) : (
          conversations.map((conv) => {
            const isSelected = currentConversation?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {conv.is_pinned ? (
                    <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 fill-amber-500" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}

                  {editingId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveRename(conv.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                      autoFocus
                      className="bg-white dark:bg-slate-900 border border-primary px-1.5 py-0.5 rounded text-xs w-full focus:outline-none"
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinChat(conv.id);
                    }}
                    className="p-1 hover:text-amber-500"
                    title={conv.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(conv.id, conv.title);
                    }}
                    className="p-1 hover:text-blue-500"
                    title="Rename"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(conv.id);
                    }}
                    className="p-1 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Folder Modal inline backdrop */}
      {showNewFolderModal && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <form onSubmit={handleCreateFolder} className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Create Folder</span>
              <button onClick={() => setShowNewFolderModal(false)}><X className="w-3.5 h-3.5" /></button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full p-1.5 text-xs rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-1 text-xs bg-primary text-white font-semibold rounded"
            >
              Save Folder
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
