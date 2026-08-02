export interface Citation {
  id: number;
  doc_name: string;
  page_num: number;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Citation[];
  created_at?: string;
  isStreaming?: boolean;
}

export interface FileAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  extracted_preview?: string;
}

export interface Conversation {
  id: string;
  title: string;
  folder_id?: string | null;
  is_pinned?: boolean;
  model_name?: string;
  system_prompt?: string;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface UserMemory {
  id: string;
  key: string;
  value: string;
  category?: string;
  is_pinned?: boolean;
  created_at?: string;
}
