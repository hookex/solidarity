/**
 * 消息组件
 * 用于显示用户问题和AI回答的消息卡片
 */

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Components } from 'react-markdown';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface MessageProps {
  role: 'user' | 'system';
  content: string;
  isHighlighted?: boolean;
  timestamp?: string;
  modelName?: string;
  type?: 'search_status' | 'thinking_status' | 'generating_status' | 'answer';
}

// 更精确的类型定义
type ReactMarkdownProps = Components & {
  node?: any;
  children?: React.ReactNode;
};

interface CodeBlockProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  inline?: boolean;
  className?: string;
}

const Message: React.FC<MessageProps> = ({ role, content, isHighlighted = false, timestamp, modelName, type }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isEmpty = !content || content.trim() === '';
  const isSystemThinking = role === 'system' && isEmpty;
  const isSearching = type === 'search_status';

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getStatusDisplay = () => {
    switch (type) {
      case 'search_status':
        return {
          dots: 'bg-blue-400',
          text: 'text-blue-500',
          content: content || '正在搜索相关信息...'
        };
      case 'thinking_status':
        return {
          dots: 'bg-purple-400',
          text: 'text-purple-500',
          content: content || '正在思考回答...'
        };
      case 'generating_status':
        return {
          dots: 'bg-green-400',
          text: 'text-green-500',
          content: content || '正在生成回答...'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div
      className={`p-2 sm:p-3 rounded-lg shadow-sm relative 
        ${isHighlighted ? 'bg-blue-50/80' : 'bg-white'}
        ${role === 'user' ? 'self-end' : 'self-start'} 
        transition-colors duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full">
        {statusDisplay && (
          <div className="flex items-center text-gray-500 mb-2">
            <div className="flex space-x-1">
              <div className={`h-1.5 w-1.5 ${statusDisplay.dots} rounded-full animate-bounce`}></div>
              <div className={`h-1.5 w-1.5 ${statusDisplay.dots} rounded-full animate-bounce [animation-delay:0.2s]`}></div>
              <div className={`h-1.5 w-1.5 ${statusDisplay.dots} rounded-full animate-bounce [animation-delay:0.4s]`}></div>
            </div>
            <span className={`ml-2 text-sm font-medium ${statusDisplay.text}`}>
              {statusDisplay.content}
            </span>
          </div>
        )}

        {!isSearching && (
          <div className="mb-1">
            {isSystemThinking ? (
              <div className="flex items-center text-gray-400">
                <div className="flex space-x-1">
                  <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="ml-2 animate-pulse font-medium">思考中</span>
              </div>
            ) : (
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                className="prose prose-sm sm:prose-base prose-slate max-w-none break-words leading-relaxed
                  [&>*:last-child]:mb-0 font-['PingFang_SC']"
                components={{
                  // 调整标题间距和留白
                  h1: ({ children }) => (
                    <h1 className="font-['PingFang_SC'] text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-['PingFang_SC'] text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-gray-800 tracking-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-['PingFang_SC'] text-sm sm:text-base font-bold mb-1 sm:mb-1.5 text-gray-800 tracking-tight">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="font-['PingFang_SC'] text-[13px] sm:text-[14px] mb-1.5 sm:mb-2 text-gray-800 leading-relaxed tracking-tight">
                      {children}
                    </p>
                  ),
                  // 优化列表间距
                  ul: ({ children }) => (
                    <ul className="font-['PingFang_SC'] list-disc list-inside mb-1.5 sm:mb-2.5 space-y-1 text-[13px] sm:text-[14px] text-gray-800">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="font-['PingFang_SC'] list-decimal list-inside mb-1.5 sm:mb-2.5 space-y-1 text-[13px] sm:text-[14px] text-gray-800">
                      {children}
                    </ol>
                  ),
                  // 优化代码块
                  code: ({ inline, className, children, ...props }: CodeBlockProps) => {
                    return (
                      <code
                        className={`${className || ''} font-mono ${
                          inline 
                            ? 'bg-gray-100 rounded px-1 py-0.5 text-[12px] sm:text-[13px] text-gray-900' 
                            : 'block p-2 sm:p-3 my-1 sm:my-2 bg-gray-50 rounded-md overflow-x-auto'
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // 链接使用正常字重
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-700 hover:text-blue-900 underline decoration-blue-400 hover:decoration-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content || ''}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* 底部信息栏 - 减小间距 */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-gray-400 mt-1 pt-1 border-t border-gray-100">
          {/* 模型名称 */}
          {modelName && role === 'system' && (
            <div className="font-medium text-gray-500">
              {modelName}
            </div>
          )}
          
          {/* 时间戳 */}
          {timestamp && (
            <div className="font-medium">
              {timestamp}
            </div>
          )}

          {/* 复制按钮 */}
          {content && (
            <button
              onClick={handleCopy}
              className={`ml-auto p-1 rounded-full focus:outline-none transition-all duration-200 ${
                isCopied ? 'scale-110' : 'hover:scale-110'
              } ${isHovered ? 'opacity-50 hover:opacity-100' : 'opacity-0'}`}
              aria-label={isCopied ? '已复制' : '复制内容'}
            >
              {isCopied ? (
                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <ClipboardIcon className="h-3.5 w-3.5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;