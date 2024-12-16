/**
 * 搜索栏组件
 * 用于接收用户输入的问题
 */

import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onHistorySelect?: (selectedIndex: number | null) => void // 新增回调
}

const SEARCH_HISTORY_KEY = 'search_history'

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, onHistorySelect }) => {
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1) // -1 表示当前输入框状态

  // 加载搜索历史记录
  useEffect(() => {
    const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }
  }, [])

  // 保存搜索记录到 localStorage
  const saveToHistory = (query: string) => {
    if (!query.trim()) return
    const updatedHistory = [query, ...history.filter((item) => item !== query)].slice(0, 10) // 保留最近 10 条记录
    setHistory(updatedHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory))
  }

  // 处理键盘事件（上下箭头）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim() !== '') {
        e.preventDefault()
        saveToHistory(value) // 保存到历史记录
        onSubmit()
        setHistoryIndex(-1) // 重置索引
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        onChange(history[newIndex]) // 设置为历史记录的值
        onHistorySelect?.(newIndex) // 触发高亮
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        onChange(history[newIndex]) // 设置为历史记录的值
        onHistorySelect?.(newIndex) // 触发高亮
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        onChange('') // 返回输入状态
        onHistorySelect?.(null) // 取消高亮
      }
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <MagnifyingGlassIcon 
          className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题..."
          className="w-full pl-10 pr-12 py-2.5 sm:py-3
            text-base
            rounded-lg border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400 bg-white shadow-sm"
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className={`absolute right-2 p-1.5 sm:p-2 rounded-md 
            transition-colors duration-200
            ${value.trim()
              ? 'text-blue-500 hover:bg-blue-50'
              : 'text-gray-400'
            }`}
        >
          <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

export default SearchBar