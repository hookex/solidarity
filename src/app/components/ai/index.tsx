'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '@/app/components/SearchBar';
import MessageList from '@/app/components/MessageList';

type MessageData = {
  id: number;
  role: 'user' | 'system';
  content: string; // Markdown 格式内容
  timestamp: string; // 添加时间戳字段
};

const SESSION_STORAGE_KEY = 'ai_session_id';
const CONTEXT_STORAGE_KEY = 'ai_chat_context';

// 生成唯一 sessionId 的工具函数
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

async function fetchStream(
  sessionId: string,
  prompt: string,
  context: MessageData[],
  onChunk: (chunk: string) => void
) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, prompt, context }),
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}

export default function AIPage() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null); // 当前高亮索引
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);

  // 初始化 sessionId 和消息上下文
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);

      const storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
      if (storedContext) {
        setMessages(JSON.parse(storedContext));
      }
    }
  }, []);

  // 更新本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // 滚动到高亮消息
  useEffect(() => {
    if (chatWindowRef.current && highlightIndex !== null) {
      const messageElement = chatWindowRef.current.querySelector(
        `[data-index="${highlightIndex}"]`
      ) as HTMLDivElement;
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [highlightIndex]);

  const generateId = () => Math.floor(Math.random() * 1000000);

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19); // 格式化为 YYYY-MM-DD HH:mm:ss
  };

  const handleSearch = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setInput('');
    setIsLoading(true);

    const userMessage: MessageData = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: getCurrentTimestamp(), // 添加时间戳
    };
    setMessages((prev) => [userMessage, ...prev]); // 新消息插入到数组顶部

    const systemMessage: MessageData = {
      id: generateId(),
      role: 'system',
      content: '',
      timestamp: getCurrentTimestamp(), // 添加时间戳
    };
    setMessages((prev) => [systemMessage, ...prev]); // 系统消息插入到数组顶部

    try {
      await fetchStream(sessionId || '', prompt, messages, (chunk) => {
        setMessages((prev) => {
          const updatedMessage = {
            ...prev[0],
            content: prev[0].content + chunk,
          };
          return [updatedMessage, ...prev.slice(1)]; // 更新顶部消息
        });
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessages((prev) => [
        {
          id: generateId(),
          role: 'system',
          content: '发生错误：无法获取数据。',
          timestamp: getCurrentTimestamp(), // 添加时间戳
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <div className="pt-10 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-800">AI搜索</h1>
      </div>

      <div className="w-full flex justify-center py-2 px-4 sm:px-6 lg:px-8">
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={handleSearch}
          onHistorySelect={(index) => setHighlightIndex(index)} // 高亮回调
        />
      </div>

      {/* 使用 MessageList 渲染消息 */}
      <MessageList
        messages={messages}
        highlightIndex={highlightIndex}
        isLoading={isLoading}
        chatWindowRef={chatWindowRef}
      />
    </div>
  );
}