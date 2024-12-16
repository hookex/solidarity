import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAISearchStore } from '@/app/store/AISearchStore';

/**
 * 调试按钮组件
 * 提供调试相关功能按钮
 */

const DebugButtons: React.FC = () => {
  const setMessages = useAISearchStore(state => state.setMessages);

  const clearMessages = () => {
    setMessages([]);  // 清空消息数据
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
      <button
        onClick={clearMessages}
        className="p-1.5 bg-gray-100 text-gray-500 rounded-md shadow-sm 
          hover:bg-gray-200 hover:text-gray-600 transition-colors"
        aria-label="清空消息"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DebugButtons; 