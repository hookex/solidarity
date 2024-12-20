# AI Search

[![Deploy Solidarity App to ECS](https://github.com/hookex/solidarity/actions/workflows/nextjs.yml/badge.svg)](https://github.com/hookex/solidarity/actions/workflows/nextjs.yml)

一个基于多个大语言模型的智能搜索应用，支持实时对话和联网搜索。

## 特性

- 🤖 支持多个大语言模型并行对话
  - 豆包 AI
  - Moonshot AI
  - 智谱 AI
- 🌐 支持联网实时搜索
- ⚡️ 流式实时响应
- 💬 精简准确的回答（限制在140字以内）
- 🎨 优雅的界面设计
- 📱 完整的移动端适配

## 在线体验

- Vercel: https://solidarity-hooke.vercel.app/
- 服务器: http://101.126.159.154:3000/

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/hookex/solidarity.git
cd solidarity
```

## Data

https://console.volcengine.com/apmplus/region:apmplus+cn-beijing/webpro/url_list

2. 安装依赖
```bash
npm install
# 或
yarn
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 打开浏览器访问 http://localhost:3000

## 技术栈

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- 火山方舟 API

## 部署

项目支持多种部署方式：

- [Vercel](https://vercel.com/new)
- [Github Actions](https://github.com/hookex/solidarity/actions)
- Docker (待补充)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License