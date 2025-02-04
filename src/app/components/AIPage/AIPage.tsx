/**
 * AI搜索页面组件
 * 整个应用的主页面，包含搜索栏和消息列表
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '@/app/components/SearchBar/SearchBar';
import MessageList from '@/app/components/MessageList/MessageList';
import { useAISearchStore, initializeAISearchStore } from '@/app/store/AISearchStore';
import { AIService, generateId, getCurrentTimestamp } from '@/app/services/api';
import DebugButtons from '@/app/components/DebugButtons/DebugButtons';
import styles from './index.module.css';

export default function AIPage() {
  const [input, setInput] = useState<string>('');  // 输入框内容
  const chatWindowRef = useRef<HTMLDivElement>(null);  // 聊天窗口引用
  
  // 从store中获取状态和方法
  const { 
    messages,          // 消息列表
    sessionId,         // 会话ID
    isLoading,         // 加载状态
    highlightIndex,    // 高亮索引
    addMessage,        // 添加消息方法
    updateMessage,     // 更新消息方法
    setIsLoading,      // 设置加载状态
    setHighlightIndex  // 设置高亮索引
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
    <div className="relative w-full bg-gray-50">
      <div className={`${styles.searchBarContainer} ${messages.length === 0 ? styles.searchBarInitial : styles.searchBarFixed}`}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">AI搜索</h1>
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={handleSearch}
          onHistorySelect={setHighlightIndex}
        />
      </div>
      
      {messages.length > 0 && (
        <div className="w-full max-w-3xl mx-auto px-4 pb-12" style={{ paddingTop: '150px' }}>
          <MessageList
            messages={messages}
            highlightIndex={highlightIndex}
            isLoading={isLoading}
          />
        </div>
      )}

      {process.env.NODE_ENV === 'development' && <DebugButtons />}
    </div>
  );
}