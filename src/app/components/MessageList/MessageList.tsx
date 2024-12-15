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

  // 按问题分组消息
  const groupedMessages = messages.reduce((groups, message) => {
    if (message.role === 'user') {
      // 创建新的问题组
      groups.push({
        question: message,
        answers: []
      });
    } else if (message.role === 'system' && groups.length > 0) {
      // 将回答添加到最近的问题组
      groups[groups.length - 1].answers.push(message);
    }
    return groups;
  }, [] as { question: MessageData; answers: MessageData[] }[]);

  return (
    <div
      ref={chatWindowRef}
      className="p-2 sm:p-6 overflow-y-auto mx-auto w-full max-w-3xl overscroll-none"
      style={{ 
        height: 'calc(100vh - 120px)',
        WebkitOverflowScrolling: 'touch', // 启用弹性滚动
      }}
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.question.id} className="relative">
          {/* 分割线 */}
          {groupIndex > 0 && (
            <div className="absolute -top-3 left-0 right-0 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          )}

          <div className="mb-8 pt-3">
            {/* 问题 */}
            <div className="text-sm sm:text-base text-gray-700 mb-3 px-1 font-medium">
              {group.question.content}
            </div>

            {/* 回答卡片 */}
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto"
              columnClassName="bg-clip-padding"
            >
              {group.answers.map((answer, index) => (
                <animated.div
                  key={answer.id}
                  style={transitions[index]}
                  data-index={index}
                  className="mb-2"
                >
                  <div className={`rounded-lg shadow ${
                    highlightIndex === index ? 'bg-blue-50/80' : 'bg-white border border-gray-200'
                  }`}>
                    <Message
                      role={answer.role}
                      content={answer.content}
                      isHighlighted={highlightIndex === index}
                      timestamp={answer.timestamp}
                      modelName={answer.modelName}
                      type={answer.type}
                    />
                  </div>
                </animated.div>
              ))}
            </Masonry>

            {/* 加载状态 */}
            {isLoading && groupIndex === groupedMessages.length - 1 && (
              <animated.div
                style={loadingSpring}
                className="flex justify-center items-center text-gray-500 mt-2"
              >
                <div className="loader">加载中...</div>
              </animated.div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;