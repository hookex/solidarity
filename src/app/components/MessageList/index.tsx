import React from 'react';
import Masonry from 'react-masonry-css';
import Message from '@/app/components/message';

interface MessageData {
  id: number;
  role: 'user' | 'system';
  content: string;
}

interface MessageListProps {
  messages: MessageData[];
  highlightIndex: number | null;
  isLoading: boolean;
  chatWindowRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
                                                   messages,
                                                   highlightIndex,
                                                   isLoading,
                                                   chatWindowRef,
                                                 }) => {
  const breakpointColumns = {
    default: 3, // 默认三列布局
    768: 1, // 小屏幕单列
  };

  return (
    <div
      ref={chatWindowRef}
      className="p-6 overflow-y-auto mx-auto"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto gap-4"
        columnClassName="masonry-column"
      >
        {messages.map((message, index) => (
          <div key={message.id} data-index={index}>
            {/* 渲染单个 Message */}
            <Message
              role={message.role}
              content={message.content}
              isHighlighted={highlightIndex === index} // 传递高亮信息
            />
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center items-center col-span-2">
            <div className="loader">加载中...</div>
          </div>
        )}
      </Masonry>
    </div>
  );
};

export default MessageList;