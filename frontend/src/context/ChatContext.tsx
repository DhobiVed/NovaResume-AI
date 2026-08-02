import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Conversation, Folder, Message, FileAttachment, ModelOption } from '../types';
import { api } from '../services/api';

interface ChatContextType {
  conversations: Conversation[];
  folders: Folder[];
  currentConversation: Conversation | null;
  messages: Message[];
  attachments: FileAttachment[];
  selectedModel: string;
  systemPrompt: string;
  isGenerating: boolean;
  activeFolderId: string | null;
  searchQuery: string;
  availableModels: ModelOption[];
  setSearchQuery: (query: string) => void;
  setActiveFolderId: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  createNewChat: () => Promise<Conversation>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastResponse: () => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, newTitle: string) => Promise<void>;
  togglePinChat: (id: string) => Promise<void>;
  moveChatToFolder: (id: string, folderId: string | null) => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  uploadFileAttachment: (file: File) => Promise<void>;
  deleteFileAttachment: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are NovaChat AI, an advanced intelligent AI assistant.');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [convs, flds, modelRes] = await Promise.all([
        api.getConversations(),
        api.getFolders(),
        api.getModels()
      ]);
      setConversations(convs);
      setFolders(flds);
      if (modelRes.models && modelRes.models.length > 0) {
        setAvailableModels(modelRes.models);
      }
      if (convs.length > 0) {
        selectConversation(convs[0].id);
      } else {
        createNewChat();
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  const refreshConversations = async () => {
    const convs = await api.getConversations(activeFolderId || undefined, searchQuery || undefined);
    setConversations(convs);
  };

  useEffect(() => {
    refreshConversations();
  }, [activeFolderId, searchQuery]);

  const selectConversation = async (id: string) => {
    try {
      const details = await api.getConversationDetails(id);
      setCurrentConversation({
        id: details.id,
        title: details.title,
        folder_id: details.folder_id,
        is_pinned: details.is_pinned,
        model_name: details.model_name,
        system_prompt: details.system_prompt
      });
      setMessages(details.messages || []);
      setAttachments(details.attachments || []);
      if (details.model_name) setSelectedModel(details.model_name);
      if (details.system_prompt) setSystemPrompt(details.system_prompt);
    } catch (e) {
      console.error('Error fetching conversation details:', e);
    }
  };

  const createNewChat = async (): Promise<Conversation> => {
    const newConv = await api.createConversation('New Chat', activeFolderId || undefined);
    await refreshConversations();
    await selectConversation(newConv.id);
    return newConv;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    let convId = currentConversation?.id;
    if (!convId) {
      const created = await createNewChat();
      convId = created.id;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    const assistantMsgPlaceholder: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
    setIsGenerating(true);

    const controller = api.streamChat(
      convId,
      text,
      selectedModel,
      systemPrompt,
      attachments.map((a) => a.id),
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + token
            };
          }
          return updated;
        });
      },
      (citations) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              sources: citations
            };
          }
          return updated;
        });
      },
      (msgId) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              id: msgId,
              isStreaming: false
            };
          }
          return updated;
        });
        setIsGenerating(false);
        setAbortController(null);
        refreshConversations();
      },
      (err) => {
        console.error('Streaming error:', err);
        setIsGenerating(false);
        setAbortController(null);
      }
    );

    setAbortController(controller);
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGenerating(false);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
        }
        return updated;
      });
    }
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2 || isGenerating) return;
    const userMsgs = messages.filter((m) => m.role === 'user');
    const lastUserPrompt = userMsgs[userMsgs.length - 1]?.content;
    if (lastUserPrompt) {
      setMessages((prev) => prev.filter((_, idx) => idx < prev.length - 1));
      await sendMessage(lastUserPrompt);
    }
  };

  const deleteChat = async (id: string) => {
    await api.deleteConversation(id);
    await refreshConversations();
    if (currentConversation?.id === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        selectConversation(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const renameChat = async (id: string, newTitle: string) => {
    await api.updateConversation(id, { title: newTitle });
    await refreshConversations();
    if (currentConversation?.id === id) {
      setCurrentConversation((prev) => (prev ? { ...prev, title: newTitle } : null));
    }
  };

  const togglePinChat = async (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (target) {
      await api.updateConversation(id, { is_pinned: !target.is_pinned });
      await refreshConversations();
    }
  };

  const moveChatToFolder = async (id: string, folderId: string | null) => {
    await api.updateConversation(id, { folder_id: folderId });
    await refreshConversations();
  };

  const createFolder = async (name: string, color?: string) => {
    await api.createFolder(name, color);
    const updated = await api.getFolders();
    setFolders(updated);
  };

  const deleteFolder = async (id: string) => {
    await api.deleteFolder(id);
    const updated = await api.getFolders();
    setFolders(updated);
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const uploadFileAttachment = async (file: File) => {
    if (!currentConversation?.id) return;
    const att = await api.uploadFile(file, currentConversation.id);
    setAttachments((prev) => [...prev, att]);
  };

  const deleteFileAttachment = async (id: string) => {
    await api.deleteFile(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        folders,
        currentConversation,
        messages,
        attachments,
        selectedModel,
        systemPrompt,
        isGenerating,
        activeFolderId,
        searchQuery,
        availableModels,
        setSearchQuery,
        setActiveFolderId,
        setSelectedModel,
        setSystemPrompt,
        createNewChat,
        selectConversation,
        sendMessage,
        stopGeneration,
        regenerateLastResponse,
        deleteChat,
        renameChat,
        togglePinChat,
        moveChatToFolder,
        createFolder,
        deleteFolder,
        uploadFileAttachment,
        deleteFileAttachment,
        refreshConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
