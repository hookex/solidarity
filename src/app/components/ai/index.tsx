'use client'

import React, { useState, useEffect, useRef } from 'react'
import SearchBar from '@/app/components/SearchBar'
import MessageList from '@/app/components/MessageList'
import styles from './index.module.css'

type MessageData = {
  id: number
  role: 'user' | 'system'
  content: string // Markdown 格式内容
}

const SESSION_STORAGE_KEY = 'ai_session_id'
const CONTEXT_STORAGE_KEY = 'ai_chat_context'

// 生成唯一 sessionId 的工具函数
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

async function fetchStream(
  sessionId: string,
  prompt: string,
  context: MessageData[],
  onChunk: (chunk: string) => void
) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, prompt, context })
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    onChunk(chunk)
  }
}

export default function AIPage() {
  const [input, setInput] = useState<string>('')
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null) // 当前高亮索引
  const chatWindowRef = useRef<HTMLDivElement>(null)

  const [sessionId, setSessionId] = useState<string>(() => {
    let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!storedSessionId) {
      storedSessionId = generateSessionId()
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId)
    }
    return storedSessionId
  })

  const generateId = () => Math.floor(Math.random() * 1000000)

  useEffect(() => {
    const storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY)
    if (storedContext) {
      setMessages(JSON.parse(storedContext))
    }
  }, [])

  useEffect(() => {
    if (chatWindowRef.current && highlightIndex !== null) {
      const messageElement = chatWindowRef.current.querySelector(
        `[data-index="${highlightIndex}"]`
      ) as HTMLDivElement
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages, highlightIndex])

  const handleSearch = async () => {
    const prompt = input.trim()
    if (!prompt) return

    setInput('')
    setIsLoading(true)

    const userMessage: MessageData = {
      id: generateId(),
      role: 'user',
      content: prompt
    }
    setMessages((prev) => [userMessage, ...prev]) // 新消息插入到数组顶部

    const systemMessage: MessageData = {
      id: generateId(),
      role: 'system',
      content: ''
    }
    setMessages((prev) => [systemMessage, ...prev]) // 系统消息插入到数组顶部

    try {
      await fetchStream(sessionId, prompt, messages, (chunk) => {
        setMessages((prev) => {
          const updatedMessage = {
            ...prev[0],
            content: prev[0].content + chunk
          }
          return [updatedMessage, ...prev.slice(1)] // 更新顶部消息
        })
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessages((prev) => [
        {
          id: generateId(),
          role: 'system',
          content: '发生错误：无法获取数据。'
        },
        ...prev
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      <div className="pt-10 flex justify-center">
        <h1 className="text-3xl font-bold text-gray-800">AI搜索</h1>
      </div>

      <div className="w-full flex justify-center py-2 px-4 sm:px-6 lg:px-8">
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={handleSearch}
          onHistorySelect={(index) => setHighlightIndex(index)} // 高亮回调
        />
      </div>

      {/* 消息区域 */}
      <div ref={chatWindowRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        {messages.map((message, index) => (
          <div
            key={message.id}
            data-index={index}
            className={`p-4 rounded-lg shadow mb-4 ${
              highlightIndex === index ? 'bg-blue-100' : 'bg-white'
            }`}
          >
            {message.content}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="loader">加载中...</div>
          </div>
        )}
      </div>
    </div>
  )
}