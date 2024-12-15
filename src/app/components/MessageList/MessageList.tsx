import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import Message from '../Message/Message';
import { MessageData } from '@/app/store/AISearchStore';
import { useTransition, animated, config, useSpring } from '@react-spring/web';

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
  // 添加布局初始化状态
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // 确保在客户端渲染后再显示内容
    setIsLayoutReady(true);
  }, []);

  const breakpointColumns = {
    default: 1,
  };

  const filteredMessages = messages.filter(item => 
    item.role === 'system' && item.content && item.content.trim() !== ''
  );

  // 消息列表的过渡动画
  const transitions = useTransition(filteredMessages, {
    keys: item => item.id,
    from: { opacity: 0, transform: 'scale(0.9)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.9)' },
    config: config.gentle,
    immediate: isLayoutReady,
    initial: { opacity: 1, transform: 'scale(1)' },
  });

  // 加载动画
  const loadingSpring = useSpring({
    opacity: isLoading ? 1 : 0,
    config: config.gentle,
  });

  return (
    <div
      ref={chatWindowRef}
      className="p-2 sm:p-6 overflow-y-auto mx-auto w-full max-w-3xl"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {transitions((style, message, _, index) => (
          <animated.div
            key={message.id}
            style={style}
            data-index={index}
            className="mb-2"
          >
            <div className={`rounded-lg shadow ${
              highlightIndex === index ? 'bg-blue-50/80' : 'bg-white border border-gray-200'
            }`}>
              <Message
                role={message.role}
                content={message.content}
                isHighlighted={highlightIndex === index}
                timestamp={message.timestamp}
                modelName={message.modelName}
              />
            </div>
          </animated.div>
        ))}
      </Masonry>

      {isLoading && (
        <animated.div
          style={loadingSpring}
          className="flex justify-center items-center col-span-2 text-gray-500"
        >
          <div className="loader">加载中...</div>
        </animated.div>
      )}
    </div>
  );
};

export default MessageList;