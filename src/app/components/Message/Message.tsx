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
              <span className="ml-2 animate-pulse">思考中</span>
            </div>
          ) : (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              className="break-words"
            >
              {content || ''}
            </ReactMarkdown>
          )}
        </div>

        {/* 时间戳 */}
        {timestamp && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-400 whitespace-nowrap">
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