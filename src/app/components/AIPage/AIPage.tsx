'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '@/app/components/SearchBar/SearchBar';
import MessageList from '@/app/components/MessageList/MessageList';
import { useAISearchStore, initializeAISearchStore } from '@/app/store/AISearchStore';
import { AIService, generateId, getCurrentTimestamp } from '@/app/services/api';
import DebugButtons from '@/app/components/DebugButtons/DebugButtons';

export default function AIPage() {
  const [input, setInput] = useState<string>('');
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    sessionId, 
    isLoading, 
    highlightIndex,
    addMessage,
    updateMessage,
    setIsLoading,
    setHighlightIndex 
  } = useAISearchStore();

  // 初始化 store
  useEffect(() => {
    console.log('Initializing store...');
    initializeAISearchStore();
  }, []);

  // 监听消息变化
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  const handleSearch = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setInput('');
    setIsLoading(true);

    // 添加用户问题
    const questionId = generateId();
    addMessage({
      id: questionId,
      role: 'user',
      content: prompt,
      timestamp: getCurrentTimestamp(),
    });

    // 为每个模型添加一个空的系统消息
    const modelMessages = new Map();

    try {
      const result = await AIService.searchStream(
        {
          sessionId: sessionId || '',
          prompt,
          context: messages,
        },
        (modelId, chunk, modelName) => {
          // 调试日志
          console.log('Received message:', { modelId, chunk, modelName });
          
          if (!modelMessages.has(modelId)) {
            const messageId = generateId();
            modelMessages.set(modelId, messageId);
            addMessage({
              id: messageId,
              role: 'system',
              content: '',
              timestamp: getCurrentTimestamp(),
              modelId,
              modelName,
              questionId, // 添加关联的问题ID
            });
          }
          
          const messageId = modelMessages.get(modelId);
          updateMessage(messageId, (prevContent) => prevContent + chunk);
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
    <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-hidden">
      <div className="pt-4 sm:pt-10 flex justify-center flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">AI搜索</h1>
      </div>

      <div className="w-full flex justify-center p-2 sm:py-2 sm:px-4 lg:px-8 flex-shrink-0">
        <div className="w-full max-w-3xl px-2 sm:px-0">
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={handleSearch}
            onHistorySelect={setHighlightIndex}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          highlightIndex={highlightIndex}
          isLoading={isLoading}
          chatWindowRef={chatWindowRef}
        />
      </div>

      <DebugButtons />
    </div>
  );
}