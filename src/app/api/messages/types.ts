/**
 * 基础消息类型
 */
export interface Message {
  id: number;
  role: 'user' | 'system';
  content: string;
  timestamp: string;
  modelId?: string;
  modelName?: string;
  questionId?: number;
  sessionId: string;
}

/**
 * 消息状态类型
 */
export type MessageStatus = 'search_status' | 'thinking_status' | 'generating_status' | 'answer';

/**
 * 扩展消息类型（包含状态）
 */
export interface MessageWithStatus extends Message {
  type?: MessageStatus;
}

export interface CreateMessageRequest {
  message: Omit<Message, 'id'>;
}

export interface UpdateMessageRequest {
  id: number;
  content: string;
}
