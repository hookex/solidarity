import { useState, useEffect, useRef } from 'react';
import { Input, Spin, Message as Notification } from '@arco-design/web-react';
import { useTransition, animated } from '@react-spring/web';

interface Message {
  id: number;
  role: 'user' | 'system';
  content: string;
}

async function fetchStream(prompt: string, onChunk: (chunk: string) => void) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}

export default function AIPage() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // 动态为消息生成唯一 ID
  const generateId = () => Math.floor(Math.random() * 1000000);

  // 使用 react-spring 的 useTransition 实现卡片动画
  const transitions = useTransition(messages, {
    key: (msg) => msg.id,
    from: { transform: 'translateY(-50%)', opacity: 0 },
    enter: { transform: 'translateY(0%)', opacity: 1 },
    leave: { transform: 'translateY(-50%)', opacity: 0 },
    trail: 100,
  });

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() !== '') {
      e.preventDefault();

      if (isLoading) {
        Notification.warning({ content: '请等待当前请求完成后再提交！' });
        return;
      }

      const prompt = input.trim();
      setInput(''); // 清空输入框
      setIsLoading(true);

      // 插入空白系统消息
      const systemMessage: Message = {
        id: generateId(),
        role: 'system',
        content: '',
      };

      setMessages((prev) => [systemMessage, ...prev]);

      try {
        await fetchStream(prompt, (chunk) => {
          setMessages((prev) => {
            // 只更新答案部分，不显示问题内容
            const updatedMessage = {
              ...prev[0],
              content: prev[0].content + chunk, // 累积答案内容
            };
            return [updatedMessage, ...prev.slice(1)];
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Notification.error({ content: '请求失败，请稍后再试！' });
        setMessages((prev) => [
          {
            id: generateId(),
            role: 'system',
            content: '发生错误：无法获取数据。',
          },
          ...prev,
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 输入框固定在顶部 */}
      <div className="w-full bg-white px-4 py-4 shadow-md">
        <Input.TextArea
          value={input}
          onChange={(value) => handleInputChange(value)}
          onKeyDown={handleKeyPress}
          placeholder="请输入提示词并按 Enter 提交，Shift + Enter 换行"
          className="w-full max-w-2xl mx-auto border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoSize={{ minRows: 1, maxRows: 3 }}
          allowClear
        />
      </div>

      {/* 消息区域 */}
      <div
        className="flex flex-col gap-4 max-w-2xl w-full p-6 bg-gray-50 overflow-y-auto mx-auto mt-4 rounded-lg shadow-lg"
        style={{ height: 'calc(100vh - 120px)' }}
        ref={chatWindowRef}
      >
        {transitions((style, item) => (
          <animated.div
            style={style}
            className={`p-4 rounded-lg text-base shadow-md ${
              item.role === 'system'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-200 text-blue-800 self-end'
            }`}
          >
            {item.content}
          </animated.div>
        ))}

        {isLoading && (
          <div className="flex justify-center items-center">
            <Spin />
          </div>
        )}
      </div>
    </div>
  );
}
