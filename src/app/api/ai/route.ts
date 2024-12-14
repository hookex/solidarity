import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
	apiKey: 'da8a4250-7bce-493d-92b0-a12b2b4e4590',
	baseURL: 'https://ark.cn-beijing.volces.com/api/v3', // 请确保这个 URL 是有效的
});

// 初始化对话上下文（可以存储在内存或持久化存储中）
const contextMap = new Map(); // 使用 Map 存储每个会话的上下文

export async function POST(request: NextRequest) {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	// 获取请求的 JSON 数据
	const { prompt, sessionId } = await request.json();

	// 确保 sessionId 存在，用于区分不同用户或会话
	if (!sessionId) {
		return new NextResponse('Missing sessionId', { status: 400 });
	}

	// 获取当前会话的上下文（默认为空数组）
	const context = contextMap.get(sessionId) || [
		{ role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
	];

	// 将用户输入加入上下文
	context.push({ role: 'user', content: prompt });

	// 创建一个流对象
	const stream = new ReadableStream({
		async start(controller) {
			console.log('----- streaming request -----');
			try {
				// 发起 OpenAI 请求，带上下文对话
				const openaiStream = await openai.chat.completions.create({
					messages: context, // 使用上下文
					model: 'ep-20241203130210-txrtw',
					// model: 'bot-20241214140237-g9dqh',
					stream: true,
				});

				// 处理流数据
				let assistantResponse = ''; // 保存助手的完整回复
				for await (const part of openaiStream) {
					const content = part.choices[0]?.delta?.content || '';
					console.log('Stream chunk:', content); // 调试日志
					if (content) {
						assistantResponse += content; // 累积助手的回复
						controller.enqueue(encoder.encode(content));
					}
				}

				// 将助手的回复加入上下文
				context.push({ role: 'assistant', content: assistantResponse });

				// 更新上下文
				contextMap.set(sessionId, context);
			} catch (error) {
				console.error('Error during streaming:', error);
				controller.enqueue(encoder.encode('Error occurred while processing the request.'));
			} finally {
				controller.close();
			}
		},
	});

	// 返回流作为响应
	return new NextResponse(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache',
		},
	});
}