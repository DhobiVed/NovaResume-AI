import type { Conversation, Folder, FileAttachment, UserMemory, ModelOption } from '../types';

import { API_BASE } from '../config';

export const api = {
  // Conversations
  async getConversations(folderId?: string, search?: string): Promise<Conversation[]> {
    const params = new URLSearchParams();
    if (folderId) params.append('folder_id', folderId);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/conversations?${params.toString()}`);
    return res.json();
  },

  async createConversation(title?: string, folderId?: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, folder_id: folderId })
    });
    return res.json();
  },

  async getConversationDetails(id: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    return res.json();
  },

  async updateConversation(id: string, updates: Partial<Conversation>) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteConversation(id: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async exportConversation(id: string, format: string) {
    window.open(`${API_BASE}/conversations/${id}/export?format=${format}`, '_blank');
  },

  // Folders
  async getFolders(): Promise<Folder[]> {
    const res = await fetch(`${API_BASE}/conversations/folders/list`);
    return res.json();
  },

  async createFolder(name: string, color?: string): Promise<Folder> {
    const res = await fetch(`${API_BASE}/conversations/folders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    return res.json();
  },

  async deleteFolder(id: string) {
    const res = await fetch(`${API_BASE}/conversations/folders/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Files
  async uploadFile(file: File, conversationId: string): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async getConversationFiles(conversationId: string): Promise<FileAttachment[]> {
    const res = await fetch(`${API_BASE}/files/conversation/${conversationId}`);
    return res.json();
  },

  async previewFile(fileId: string) {
    const res = await fetch(`${API_BASE}/files/${fileId}/preview`);
    return res.json();
  },

  async searchPdf(fileId: string, query: string) {
    const res = await fetch(`${API_BASE}/files/${fileId}/search-pdf?query=${encodeURIComponent(query)}`);
    return res.json();
  },

  async deleteFile(fileId: string) {
    const res = await fetch(`${API_BASE}/files/${fileId}`, { method: 'DELETE' });
    return res.json();
  },

  // Document Generation
  async generateDocument(title: string, docType: string, format: string, content: string) {
    const res = await fetch(`${API_BASE}/docgen/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, doc_type: docType, format, content })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/ /g, '_')}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  async generateGraphicResume(resumeData: any, themeKey: string = 'royal_blue') {
    const res = await fetch(`${API_BASE}/docgen/graphic-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resumeData, theme_key: themeKey })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.fullName ? resumeData.fullName.replace(/ /g, '_').toLowerCase() : 'resume'}_graphic.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // User Memory
  async getMemories(): Promise<UserMemory[]> {
    const res = await fetch(`${API_BASE}/memory`);
    return res.json();
  },

  async addMemory(key: string, value: string, category: string = 'general', isPinned: boolean = false): Promise<UserMemory> {
    const res = await fetch(`${API_BASE}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, category, is_pinned: isPinned })
    });
    return res.json();
  },

  async deleteMemory(id: string) {
    const res = await fetch(`${API_BASE}/memory/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Models
  async getModels(): Promise<{ active_provider: string; models: ModelOption[] }> {
    const res = await fetch(`${API_BASE}/models`);
    return res.json();
  },

  async updateApiKey(key: string) {
    const res = await fetch(`${API_BASE}/models/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key })
    });
    return res.json();
  },

  // Streaming SSE Chat API
  streamChat(
    conversationId: string,
    message: string,
    modelName: string,
    systemPrompt: string,
    fileIds: string[],
    onToken: (token: string) => void,
    onMetadata: (citations: any[]) => void,
    onDone: (msgId: string) => void,
    onError: (err: any) => void
  ) {
    const controller = new AbortController();

    fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        model_name: modelName,
        system_prompt: systemPrompt,
        file_ids: fileIds
      }),
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to connect stream');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'token') {
                  onToken(data.content);
                } else if (data.type === 'metadata') {
                  onMetadata(data.citations);
                } else if (data.type === 'done') {
                  onDone(data.message_id);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err);
        }
      });

    return controller;
  }
};
