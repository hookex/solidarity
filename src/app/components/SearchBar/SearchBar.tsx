import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'

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
        placeholder="搜索内容"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setHistoryIndex(-1) // 如果用户输入，重置索引
          onHistorySelect?.(null) // 取消高亮
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export default SearchBar