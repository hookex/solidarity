import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// 定义可用的模型配置
const AI_MODELS = {
	douBao: {
		model: 'ep-20241203130210-txrtw',
		systemPrompt: '豆包 AI'
	},
	bot: {
		model: 'ep-20241215223428-h6p4b',
		systemPrompt: 'Moonshot'
	},
	zhipu: {
		model: 'ep-20241215223536-fb4sn',
		systemPrompt: '智谱'
	}
};

const openai = new OpenAI({
	apiKey: 'da8a4250-7bce-493d-92b0-a12b2b4e4590',
	baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

const contextMap = new Map();

// 创建单个模型的流式响应
async function createModelStream(
	prompt: string,
	sessionId: string,
	modelConfig: typeof AI_MODELS[keyof typeof AI_MODELS],
	controller: ReadableStreamDefaultController
) {
	const encoder = new TextEncoder();
	
	try {
		const context = contextMap.get(`${sessionId}-${modelConfig.model}`) || [
			{ role: 'system', content: modelConfig.systemPrompt },
		];
		
		context.push({ role: 'user', content: prompt });
		
		const openaiStream = await openai.chat.completions.create({
			messages: context,
			model: modelConfig.model,
			stream: true,
		});

		let assistantResponse = '';
		for await (const part of openaiStream) {
			const content = part.choices[0]?.delta?.content || '';
			if (content) {
				assistantResponse += content;
				controller.enqueue(encoder.encode(JSON.stringify({
					model: modelConfig.model,
					content
				}) + '\n'));
			}
		}

		context.push({ role: 'assistant', content: assistantResponse });
		contextMap.set(`${sessionId}-${modelConfig.model}`, context);
		
	} catch (error) {
		console.error(`Error with model ${modelConfig.model}:`, error);
		controller.enqueue(encoder.encode(JSON.stringify({
			model: modelConfig.model,
			error: 'Error occurred while processing the request.'
		}) + '\n'));
	}
}

export async function POST(request: NextRequest) {
	const { prompt, sessionId } = await request.json();

	if (!sessionId) {
		return new NextResponse('Missing sessionId', { status: 400 });
	}

	const stream = new ReadableStream({
		async start(controller) {
			const modelPromises = Object.values(AI_MODELS).map(modelConfig =>
				createModelStream(prompt, sessionId, modelConfig, controller)
			);

			await Promise.all(modelPromises);
			controller.close();
		},
	});

	return new NextResponse(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache',
		},
	});
}