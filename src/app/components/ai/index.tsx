import React, {useState, useEffect, useRef} from 'react';
import {Input, Spin, Message as Notification} from '@arco-design/web-react';
import {useTransition, animated} from '@react-spring/web';
import {IconSearch} from "@arco-design/web-react/icon";
import styles from "./index.module.css";
import Loader from "@/app/components/loader";

interface Message {
  id: number;
  role: 'user' | 'system';
  content: string;
}

async function fetchStream(prompt: string, onChunk: (chunk: string) => void) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({prompt}),
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const {value, done} = await reader.read();
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

  const [firstRequestAnswer, setFirstRequestAnswer] = useState(false)

  // 动态为消息生成唯一 ID
  const generateId = () => Math.floor(Math.random() * 1000000);

  // 使用 react-spring 的 useTransition 实现卡片动画
  const transitions = useTransition(messages, {
    key: (msg: any) => msg.id,
    from: {transform: 'translateY(-50%)', opacity: 0},
    enter: {transform: 'translateY(0%)', opacity: 1},
    leave: {transform: 'translateY(-50%)', opacity: 0},
    trail: 100,
  });

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatWindowRef.current) {
      // chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() !== '') {
      setFirstRequestAnswer(true)
      e.preventDefault();

      // if (isLoading) {
      //   Notification.warning({content: '请等待当前请求完成后再提交！'});
      //   return;
      // }

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
        Notification.error({content: '请求失败，请稍后再试！'});
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
    <div className="flex flex-col h-screen w-screen">
      <div className={`${firstRequestAnswer ? 'pt-10' : 'pt-40'}`}>
        <div className='flex justify-center'>
          <h1 className={styles.title}>Pixel Search</h1>
        </div>

        <div className="w-full flex justify-center py-2 px-4 sm:px-6 lg:px-8">
          <Input
            className="
      w-full max-w-2xl
      px-4 py-3
      text-lg
      bg-white border border-gray-300 rounded-full
      shadow-sm
      focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent
      transition-all duration-300"
            value={input}
            onChange={(value) => handleInputChange(value)}
            onPressEnter={handleKeyPress}
            prefix={<IconSearch/>}
            allowClear
            style={{background: '#fff'}}
          />
        </div>
      </div>

      {/* 消息区域 */}
      <div
        className="flex flex-col gap-4 max-w-2xl w-full p-6 overflow-y-auto mx-auto mt-4"
        style={{height: 'calc(100vh - 120px)'}}
        ref={chatWindowRef}>
        {transitions((style, item) => (
          <animated.div
            style={style}
            className={`p-4 rounded-lg text-xs shadow-sm border ${
              item.role === 'system'
                ? 'bg-white text-black'
                : 'bg-white text-black self-end'
            }`}
          >
            {item.content}
          </animated.div>
        ))}

        {/*{isLoading && (*/}
        {/*  <div className="flex justify-center items-center">*/}
        {/*    <Spin/>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
}
