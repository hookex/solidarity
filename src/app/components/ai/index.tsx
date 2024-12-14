'use client';

import React, { useState, useEffect, useRef } from "react";
import { useTransition, animated } from "@react-spring/web";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"; // Heroicons 搜索图标
import styles from "./index.module.css";

interface Message {
  id: number;
  role: "user" | "system";
  content: string;
}

async function fetchStream(prompt: string, onChunk: (chunk: string) => void) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const [firstRequestAnswer, setFirstRequestAnswer] = useState(false);

  const generateId = () => Math.floor(Math.random() * 1000000);

  const transitions = useTransition(messages, {
    key: (msg: any) => msg.id,
    from: { transform: "translateY(-50%)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(-50%)", opacity: 0 },
    trail: 100,
  });

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() !== "") {
      setFirstRequestAnswer(true);
      e.preventDefault();

      const prompt = input.trim();
      setInput(""); // 清空输入框
      setIsLoading(true);

      const systemMessage: Message = {
        id: generateId(),
        role: "system",
        content: "",
      };

      setMessages((prev) => [systemMessage, ...prev]);

      try {
        await fetchStream(prompt, (chunk) => {
          setMessages((prev) => {
            const updatedMessage = {
              ...prev[0],
              content: prev[0].content + chunk,
            };
            return [updatedMessage, ...prev.slice(1)];
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

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <div className={`${firstRequestAnswer ? "pt-10" : "pt-40"}`}>
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold text-gray-800">Pixel Search</h1>
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
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div
        className="flex flex-col gap-4 max-w-2xl w-full p-6 overflow-y-auto mx-auto mt-4"
        style={{ height: "calc(100vh - 120px)" }}
        ref={chatWindowRef}
      >
        {transitions((style, item) => (
          <animated.div
            style={style}
            className={`p-4 rounded-lg text-xs shadow-sm border ${
              item.role === "system"
                ? "bg-white text-black"
                : "bg-gray-200 text-black self-end"
            }`}
          >
            {item.content}
          </animated.div>
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