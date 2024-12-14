'use client';

import React, { useState, useEffect, useRef } from "react";
import { useTransition } from "@react-spring/web";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import styles from "./index.module.css";
import Message from "@/app/components/message";

interface MessageData {
  id: number;
  role: "user" | "system";
  content: string; // Markdown 格式内容
}

const SESSION_STORAGE_KEY = "ai_session_id";
const CONTEXT_STORAGE_KEY = "ai_chat_context";

// 生成唯一 sessionId 的工具函数
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

async function fetchStream(sessionId: string, prompt: string, context: MessageData[], onChunk: (chunk: string) => void) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, prompt, context }),
  });

  if (!response.body) throw new Error("No response body");

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
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string>(() => {
    let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
    }
    return storedSessionId;
  });

  const generateId = () => Math.floor(Math.random() * 1000000);

  // 使用 useTransition 确保新消息动画显示在顶部
  const transitions = useTransition(
    messages.filter((msg) => msg.role === "system"), // 只保留系统消息
    {
    key: (msg) => msg.id,
    from: { transform: "translateY(-20px)", opacity: 0 },
    enter: { transform: "translateY(0)", opacity: 1 },
    leave: { transform: "translateY(-20px)", opacity: 0 },
    trail: 100,
  });

  useEffect(() => {
    const storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (storedContext) {
      setMessages(JSON.parse(storedContext));
    }
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = 0; // 确保视图滚动到最上方
    }

    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      const prompt = input.trim();
      setInput("");
      setIsLoading(true);

      const userMessage: MessageData = {
        id: generateId(),
        role: "user",
        content: prompt,
      };
      setMessages((prev) => [userMessage, ...prev]); // 新消息插入到数组顶部

      const systemMessage: MessageData = {
        id: generateId(),
        role: "system",
        content: "",
      };
      setMessages((prev) => [systemMessage, ...prev]); // 系统消息插入到数组顶部

      try {
        await fetchStream(sessionId, prompt, messages, (chunk) => {
          setMessages((prev) => {
            const updatedMessage = {
              ...prev[0],
              content: prev[0].content + chunk,
            };
            return [updatedMessage, ...prev.slice(1)]; // 更新顶部消息
          });
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessages((prev) => [
          {
            id: generateId(),
            role: "system",
            content: "发生错误：无法获取数据。",
          },
          ...prev,
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <div className="pt-10 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-800">Chat Interface</h1>
      </div>

      <div className="w-full flex justify-center py-2 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-2xl">
          <MagnifyingGlassIcon
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
          />
          <input
            type="text"
            className="
              w-full pl-12 pr-4 py-3 text-lg text-gray-800 bg-white border border-gray-300 rounded-full shadow-sm
              focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all duration-300
            "
            placeholder="请输入内容..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>

      {/* 消息区域 */}
      <div
        className="flex flex-col gap-4 max-w-2xl w-full p-6 overflow-y-auto mx-auto mt-4"
        style={{ height: "calc(100vh - 120px)" }}
        ref={chatWindowRef}
      >
        {transitions((style, item) => (
          <Message key={item.id} role={item.role} content={item.content} style={style} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className={styles.loader}></div>
          </div>
        )}
      </div>
    </div>
  );
}