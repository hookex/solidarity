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
}

const Message: React.FC<MessageProps> = ({ role, content, isHighlighted = false, timestamp }) => {
  const [isCopied, setIsCopied] = useState(false);
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
      className={`p-4 rounded-lg shadow-sm relative ${
        isHighlighted ? 'bg-blue-100 ' : 'bg-white '
      } ${role === 'user' ? 'self-end' : 'self-start'}`}
    >
      <div style={{ maxWidth: '90%', minWidth: '250px' }}>
        <div className="mb-6">
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
                // 标题保持粗体，但调整大小
                h1: ({ children }) => (
                  <h1 className="font-display text-xl font-bold mb-4 text-gray-900 tracking-tight">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-lg font-bold mb-3 text-gray-800 tracking-tight">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-base font-bold mb-2 text-gray-800 tracking-tight">{children}</h3>
                ),
                // 正文使用 14px 字体，不加粗
                p: ({ children }) => (
                  <p className="font-sans mb-4 text-gray-800 text-[14px] leading-relaxed tracking-tight">{children}</p>
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
                  <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800 text-[14px]">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800 text-[14px]">{children}</ol>
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

        {/* 时间戳 */}
        {timestamp && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-400 whitespace-nowrap font-medium">
            {timestamp}
          </div>
        )}

        {/* 复制按钮 */}
        {content && (
          <button
            onClick={handleCopy}
            className={`absolute bottom-2 right-2 p-1 rounded-full focus:outline-none transition-all duration-200 ${
              isCopied ? 'scale-110' : 'hover:scale-110'
            } opacity-50 hover:opacity-100`}
            aria-label={isCopied ? '已复制' : '复制内容'}
          >
            {isCopied ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClipboardIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Message;