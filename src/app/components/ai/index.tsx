import { useState, useEffect, useRef } from 'react';
import { Input, Spin } from '@arco-design/web-react';

interface Message {
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

  // 自动滚动到消息底部
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      const prompt = input.trim();
      setInput('');
      setIsLoading(true);

      const userMessage: Message = { role: 'user', content: prompt };
      setMessages((prev) => [...prev, userMessage]);

      const systemMessage: Message = { role: 'system', content: '' };
      setMessages((prev) => [...prev, systemMessage]);

      try {
        await fetchStream(prompt, (chunk) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            return [
              ...prev.slice(0, prev.length - 1),
              { ...lastMessage, content: lastMessage.content + chunk },
            ];
          });
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Error fetching response. Please try again later.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (value) => {
    setInput(value);
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen p-6 bg-gray-100">
      <div className="flex flex-col gap-4 max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg text-base ${
              msg.role === 'user' ? 'bg-blue-200 text-blue-800 self-end' : 'bg-green-100 text-green-800 self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center">
            {/*<Spin indicator={<IconLoading />} />*/}
          </div>
        )}
      </div>

      <Input
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="请输入提示词并敲击回车"
        className="mt-4 w-full max-w-2xl px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        size="large"
        allowClear
      />
    </div>
  );
}
