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
  type?: 'search_status' | 'thinking_status' | 'generating_status' | 'answer';
  questionId?: number; // 添加关联的问题ID
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
  updateMessage: (id: number, updater: (prevContent: string) => string) => void;
  setSessionId: (sessionId: string) => void;           // 设置会话ID
  setIsLoading: (isLoading: boolean) => void;          // 设置加载状态
  setHighlightIndex: (index: number | null) => void;   // 设置高亮消息索引

  // 添加订阅，监听消息变化
  subscribe: () => void;
}

// 本地存储键名
const SESSION_STORAGE_KEY = 'ai_session_id';     // 会话ID存储键
const CONTEXT_STORAGE_KEY = 'ai_chat_context';   // 聊天上下文存储键

/**
 * 创建 AI 搜索状态管理 Store
 */
export const useAISearchStore = create<AISearchState>((set, get) => ({
  // 初始状态
  messages: [],
  sessionId: null,
  isLoading: false,
  highlightIndex: null,

  // 状态更新方法
  setMessages: (messages) => {
    set({ messages });
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages));
  },
  
  // 在消息列表头部添加新消息
  addMessage: (message) => set((state) => {
    const updatedMessages = [message, ...state.messages];
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(updatedMessages));
    return { messages: updatedMessages };
  }),
  
  // 更新最新消息的内容（用于流式响应）
  updateMessage: (id, updater) => set((state) => {
    const updatedMessages = state.messages.map(msg =>
      msg.id === id ? { ...msg, content: updater(msg.content) } : msg
    );
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(updatedMessages));
    return { messages: updatedMessages };
  }),
  
  setSessionId: (sessionId) => set({ sessionId }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setHighlightIndex: (highlightIndex) => set({ highlightIndex }),

  // 添加订阅，监听消息变化
  subscribe: () => {
    useAISearchStore.subscribe(
      (state) => state.messages,
      (messages) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages));
        }
      }
    );
  },
}));

/**
 * 初始化 Store
 * 从本地存储恢复会话ID和聊天记录
 */
export const initializeAISearchStore = () => {
  if (typeof window === 'undefined') return;

  // 恢复会话ID
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

  // 启动订阅
  useAISearchStore.getState().subscribe();
}; 