import { create } from 'zustand';

/**
 * 消息数据类型定义
 */
export type MessageData = {
  id: number;          // 消息唯一标识
  role: 'user' | 'system';  // 消息角色：用户或系统
  content: string;     // 消息内容（Markdown格式）
  timestamp: string;   // 消息时间戳
  modelId?: string; // 添加可选的模型标识
  modelName?: string; // 添加模型名称
};

/**
 * AI搜索状态接口定义
 */
interface AISearchState {
  // 状态
  messages: MessageData[];      // 消息历史记录
  sessionId: string | null;     // 会话ID
  isLoading: boolean;          // 加载状态
  highlightIndex: number | null; // 高亮消息索引
  
  // 操作方法
  setMessages: (messages: MessageData[]) => void;       // 设置整个消息列表
  addMessage: (message: MessageData) => void;           // 添加单条消息
  updateLastMessage: (content: string) => void;         // 更新最新消息内容
  setSessionId: (sessionId: string) => void;           // 设置会话ID
  setIsLoading: (isLoading: boolean) => void;          // 设置加载状态
  setHighlightIndex: (index: number | null) => void;   // 设置高亮消息索引
  updateMessage: (id: number, updater: (prevContent: string) => string) => void;
}

// 本地存储键名
const SESSION_STORAGE_KEY = 'ai_session_id';     // 会话ID存储键
const CONTEXT_STORAGE_KEY = 'ai_chat_context';   // 聊天上下文存储键

/**
 * 创建 AI 搜索状态管理 Store
 */
export const useAISearchStore = create<AISearchState>((set) => ({
  // 初始状态
  messages: [],
  sessionId: null,
  isLoading: false,
  highlightIndex: null,

  // 状态更新方法
  setMessages: (messages) => set({ messages }),
  
  // 在消息列表头部添加新消息
  addMessage: (message) => set((state) => ({ 
    messages: [message, ...state.messages] 
  })),
  
  // 更新最新消息的内容（用于流式响应）
  updateLastMessage: (content) => set((state) => ({
    messages: [
      { ...state.messages[0], content },
      ...state.messages.slice(1)
    ]
  })),
  
  setSessionId: (sessionId) => set({ sessionId }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setHighlightIndex: (highlightIndex) => set({ highlightIndex }),
  updateMessage: (id, updater) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id
        ? { ...msg, content: updater(msg.content) }
        : msg
    )
  })),
}));

/**
 * 初始化 Store
 * 从本地存储恢复会话ID和聊天记录
 */
export const initializeAISearchStore = () => {
  // 跳过服务端执行
  if (typeof window === 'undefined') return;

  // 恢复或生成新的会话ID
  let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSessionId) {
    storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
  }
  useAISearchStore.getState().setSessionId(storedSessionId);

  // 恢复聊天记录
  const storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
  if (storedContext) {
    useAISearchStore.getState().setMessages(JSON.parse(storedContext));
  }
}; 