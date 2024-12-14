'use client';

import React, { RefObject } from 'react';
import { useTransition, animated } from '@react-spring/web';
import Message from '@/app/components/message';

interface MessageData {
  id: number;
  role: 'user' | 'system';
  content: string; // Markdown 格式内容
}

interface MessageListProps {
  messages: MessageData[];
  chatWindowRef: RefObject<HTMLDivElement>;
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, chatWindowRef, isLoading }) => {
  // 使用 useTransition 确保新消息动画显示在顶部
  const transitions = useTransition(
    messages.filter((msg) => msg.role === 'system'), // 只保留系统消息
    {
      key: (msg) => msg.id,
      from: { transform: 'translateY(-20px)', opacity: 0 },
      enter: { transform: 'translateY(0)', opacity: 1 },
      leave: { transform: 'translateY(-20px)', opacity: 0 },
      trail: 100,
    }
  );

  return (
    <div
      className="flex flex-col gap-4 max-w-2xl w-full p-6 overflow-y-auto mx-auto mt-4"
      style={{ height: 'calc(100vh - 120px)' }}
      ref={chatWindowRef}
    >
      {transitions((style, item) => (
        <Message key={item.id} role={item.role} content={item.content} style={style} />
      ))}
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="loader"></div> {/* loader 样式需要保留或引用 */}
        </div>
      )}
    </div>
  );
};

export default MessageList;