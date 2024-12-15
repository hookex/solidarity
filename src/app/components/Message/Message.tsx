import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MessageProps {
  role: 'user' | 'system';
  content: string;
  isHighlighted?: boolean;
  timestamp?: string;
  modelName?: string;
}

const Message: React.FC<MessageProps> = ({ role, content, isHighlighted = false, timestamp, modelName }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isEmpty = !content || content.trim() === '';
  const isSystemThinking = role === 'system' && isEmpty;

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  return (
    <div
      className={`p-3 rounded-lg shadow-sm relative ${
        isHighlighted ? 'bg-blue-50/80' : 'bg-white'
      } ${role === 'user' ? 'self-end' : 'self-start'} transition-colors duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full" style={{ maxWidth: '100%' }}>
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
              className="prose prose-slate max-w-none break-words leading-relaxed"
              components={{
                // 调整标题间距
                h1: ({ children }) => (
                  <h1 className="font-display text-xl font-bold mb-3 text-gray-900 tracking-tight">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-lg font-bold mb-2 text-gray-800 tracking-tight">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-base font-bold mb-1.5 text-gray-800 tracking-tight">{children}</h3>
                ),
                // 减小段落间距
                p: ({ children }) => (
                  <p className="font-sans mb-2.5 text-gray-800 text-[14px] leading-relaxed tracking-tight">{children}</p>
                ),
                // 代码使用正常字重
                code: ({ node, inline, className, children, ...props }) => (
                  <code
                    className={`${className} font-mono ${
                      inline ? 'bg-gray-100 rounded px-1.5 py-0.5 text-[13px] text-gray-900' : ''
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
                // 列表使用正常字重
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2.5 space-y-1.5 text-gray-800 text-[14px]">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2.5 space-y-1.5 text-gray-800 text-[14px]">{children}</ol>
                ),
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

        {/* 底部信息栏 - 进一步减小间距 */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1 pt-1 border-t border-gray-100">
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