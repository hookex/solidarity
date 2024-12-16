# AI 搜索

一个基于 Next.js 构建的 AI 搜索应用，支持多模型对话和实时流式响应。

## 功能特点

- 🚀 基于 Next.js 13+ 和 React 18
- 💬 支持多 AI 模型对话
- ⚡️ 实时流式响应
- 📱 响应式设计，支持移动端
- 🎨 优雅的 UI/UX 设计
- 💾 本地存储对话历史
- 🔍 支持上下文搜索
- 🌈 支持代码高亮显示

## 技术栈

- **框架**: Next.js 13+
- **UI**: Tailwind CSS
- **状态管理**: Zustand
- **Markdown 渲染**: React-Markdown
- **代码高亮**: Rehype-highlight
- **类型检查**: TypeScript

## 快速开始

1. 克隆项目
```bash
git clone [repository-url]
cd ai-search
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 打开浏览器访问 `http://localhost:3000`

## 项目结构

```
src/
├── app/                    # Next.js 13+ App 目录
│   ├── components/        # React 组件
│   │   ├── AIPage/       # 主页面组件
│   │   ├── Message/      # 消息组件
│   │   ├── MessageList/  # 消息列表组件
│   │   ├── SearchBar/    # 搜索栏组件
│   │   └── DebugButtons/ # 调试按钮组件
│   ├── store/            # 状态管理
│   └── services/         # API 服务
```

## 主要功能

### 多模型对话
- 支持多个 AI 模型同时回答
- 实时流式显示回答内容
- 支持 Markdown 格式化显示

### 消息管理
- 自动保存对话历史
- 支持清空历史记录
- 支持消息高亮显示

### 用户界面
- 响应式设计
- 暗色模式支持
- 优雅的加载动画
- 代码块语法高亮

## 开发指南

### 添加新功能
1. 在 `components` 目录创建新组件
2. 在 `store` 中添加必要的状态管理
3. 在 `services` 中添加相关 API 调用

### 代码规范
- 使用 TypeScript 类型注解
- 遵循 React Hooks 规范
- 使用 Tailwind CSS 进行样式管理

## 贡献指南

欢迎提交 Pull Request 或创建 Issue。

## 许可证

MIT License