import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MessageProps {
  role: 'user' | 'system';
  content: string;
  isHighlighted?: boolean; // 新增高亮标识
  timestamp?: string; // 新增时间戳属性
}

const Message: React.FC<MessageProps> = ({ role, content, isHighlighted = false, timestamp }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-sm relative ${
        isHighlighted ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'
      } ${role === 'user' ? 'self-end' : 'self-start'}`}>
      {/* 使用 ReactMarkdown 渲染内容 */}
      <div className="mb-6">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          className="break-words" // 确保内容自动换行
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 时间戳 */}
      {timestamp && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 whitespace-nowrap">
          {timestamp}
        </div>
      )}

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        className="absolute bottom-2 right-2 p-1 rounded-full focus:outline-none transition-opacity duration-300 opacity-50 hover:opacity-100"
        aria-label={isCopied ? '已复制' : '复制内容'}
      >
        {isCopied ? (
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ClipboardIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
    </div>
  );
};

export default Message;