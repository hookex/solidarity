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
import { messagesApi } from '@/app/api/messages/client';
import type { Message, MessageWithStatus } from '@/app/api/messages/types';

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

    try {
      const result = await AIService.searchStream(
        {
          sessionId: sessionId || '',
          prompt,
          context: messages,
        },
        async (data) => {
          if (data.messageId) {
            // 使用后端返回的消息ID更新消息
            updateMessage(data.messageId, () => data.content || '');
          }
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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