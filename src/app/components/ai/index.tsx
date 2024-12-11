import { useState } from 'react';
import styles from './index.module.css';

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
          setMessages((prev) => [
            ...prev.slice(0, prev.length - 1),
            { ...systemMessage, content: prev[prev.length - 1].content + chunk },
          ]);
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

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${
              msg.role === 'user' ? styles.messageUser : styles.messageSystem
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Loading...</div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="请输入提示词并敲击回车"
        className={styles.input}
      />
    </div>
  );
}
