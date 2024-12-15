'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '@/app/components/SearchBar/SearchBar';
import MessageList from '@/app/components/MessageList/MessageList';
import { useAISearchStore, initializeAISearchStore } from '@/app/store/AISearchStore';
import { AIService, generateId, getCurrentTimestamp } from '@/app/services/api';

const CONTEXT_STORAGE_KEY = 'ai_chat_context';

export default function AIPage() {
  const [input, setInput] = useState<string>('');
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<string>('');
  
  const { 
    messages, 
    sessionId, 
    isLoading, 
    highlightIndex,
    addMessage,
    updateLastMessage,
    setIsLoading,
    setHighlightIndex 
  } = useAISearchStore();

  // 初始化 store
  useEffect(() => {
    initializeAISearchStore();
  }, []);

  // 更新本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSearch = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setInput('');
    setIsLoading(true);
    currentMessageRef.current = '';

    // 添加用户消息
    addMessage({
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: getCurrentTimestamp(),
    });

    // 添加系统消息
    addMessage({
      id: generateId(),
      role: 'system',
      content: '',
      timestamp: getCurrentTimestamp(),
    });

    try {
      const result = await AIService.searchStream(
        {
          sessionId: sessionId || '',
          prompt,
          context: messages,
        },
        (chunk) => {
          currentMessageRef.current += chunk;
          updateLastMessage(currentMessageRef.current);
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      addMessage({
        id: generateId(),
        role: 'system',
        content: '发生错误：无法获取数据。',
        timestamp: getCurrentTimestamp(),
      });
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
          onHistorySelect={setHighlightIndex}
        />
      </div>

      <MessageList
        messages={messages}
        highlightIndex={highlightIndex}
        isLoading={isLoading}
        chatWindowRef={chatWindowRef}
      />
    </div>
  );
}