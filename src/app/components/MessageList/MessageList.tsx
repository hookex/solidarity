import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import Message from '../Message/Message';
import { MessageData } from '@/app/store/AISearchStore';

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

  // 添加加载动画组件
  const LoadingDots = () => (
    <span className="inline-flex ml-1">
      <span className="animate-[loading_1.4s_ease-in-out_infinite] rounded-full h-1 w-1 bg-gray-500 mx-0.5"></span>
      <span className="animate-[loading_1.4s_ease-in-out_0.2s_infinite] rounded-full h-1 w-1 bg-gray-500 mx-0.5"></span>
      <span className="animate-[loading_1.4s_ease-in-out_0.4s_infinite] rounded-full h-1 w-1 bg-gray-500 mx-0.5"></span>
    </span>
  );

  // 按问题分组消息，并按时间顺序显示
  const groupedMessages = messages
    .reduce((groups, message) => {
      if (message.role === 'user') {
        groups.unshift({
          question: message,
          answers: []
        });
      } else if (message.role === 'system' && groups.length > 0) {
        groups[0].answers.push(message);
      }
      return groups;
    }, [] as { question: MessageData; answers: MessageData[] }[]);

  // 添加调试日志
  console.log('Messages from store:', messages);
  console.log('Grouped messages:', groupedMessages);

  return (
    <div
      ref={chatWindowRef}
      className="p-2 sm:p-6 overflow-y-auto mx-auto w-full max-w-3xl overscroll-none touch-pan-y"
      style={{ 
        height: 'calc(100vh - 120px)',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
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
            {/* 问题显示为简单文本 */}
            <div className="text-sm sm:text-base text-gray-700 mb-3 px-1 font-medium flex items-center">
              {group.question.content}
              {isLoading && groupIndex === 0 && <LoadingDots />}
            </div>

            {/* 回答卡片 */}
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto"
              columnClassName="bg-clip-padding"
            >
              {group.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="mb-2"
                >
                  <div className={`rounded-lg shadow ${
                    highlightIndex === answer.id ? 'bg-blue-50/80' : 'bg-white border border-gray-200'
                  }`}>
                    <Message
                      role={answer.role}
                      content={answer.content}
                      isHighlighted={highlightIndex === answer.id}
                      timestamp={answer.timestamp}
                      modelName={answer.modelName}
                      type={answer.type}
                    />
                  </div>
                </div>
              ))}
            </Masonry>

            {/* 加载状态 */}
            {isLoading && groupIndex === groupedMessages.length - 1 && (
              <div
                className="flex justify-center items-center text-gray-500 mt-2"
              >
                <div className="loader">加载中...</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;