import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // 用于代码高亮
import { ClipboardIcon, CheckCircleIcon } from "@heroicons/react/24/outline"; // 复制图标 & 已复制图标
import "highlight.js/styles/github.css"; // 代码高亮样式

interface MessageProps {
  role: "user" | "system";
  content: string; // Markdown 格式内容
  style: React.CSSProperties; // 动画样式
}

const Message: React.FC<MessageProps> = ({ role, content, style }) => {
  const [isCopied, setIsCopied] = useState(false); // 控制是否已复制

  // 复制到剪贴板的函数
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(
      () => {
        setIsCopied(true); // 设置已复制状态
        setTimeout(() => setIsCopied(false), 2000); // 2 秒后重置为未复制状态
      },
      (err) => console.error("复制失败：", err)
    );
  };

  return (
    <div
      style={style}
      className={`p-4 rounded-lg text-xs shadow-sm border relative ${
        role === "system"
          ? "bg-white text-black" // 系统消息样式
          : "bg-blue-200 text-black self-end" // 用户消息样式
      }`}
    >
      {/* 消息内容部分 */}
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        className="absolute bottom-2 right-2 p-1 rounded-full focus:outline-none transition-opacity duration-300 opacity-50 hover:opacity-100"
        aria-label={isCopied ? "已复制" : "复制内容"}
      >
        {isCopied ? (
          <CheckCircleIcon className="h-4 w-4 text-green-500" /> // 已复制图标
        ) : (
          <ClipboardIcon className="h-4 w-4 text-gray-500" /> // 复制图标
        )}
      </button>
    </div>
  );
};

export default Message;