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
                // 自定义标题样式
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-800">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-gray-800">{children}</h3>,
                // 自定义段落样式
                p: ({ children }) => <p className="mb-4 text-gray-700 text-[15px] leading-relaxed">{children}</p>,
                // 自定义列表样式
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                // 自定义代码块样式
                code: ({ node, inline, className, children, ...props }) => (
                  <code
                    className={`${className} ${
                      inline ? 'bg-gray-100 rounded px-1 py-0.5 text-sm text-gray-800' : ''
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
                // 自定义链接样式
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
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