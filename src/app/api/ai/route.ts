import { NextRequest, NextResponse } from 'next/server';

// 定义可用的模型配置
const AI_MODELS = {
	douBao: {
		model: 'ep-20241203130210-txrtw',
		systemPrompt: '你是一个智能助手，请基于联网搜索结果提供准确、客观的回答。回答要简洁清晰，并标注信息来源。',
		name: '豆包 AI'
	},
	bot: {
		model: 'ep-20241215223428-h6p4b',
		systemPrompt: '你是 Moonshot AI 助手，请基于联网搜索结果提供全面、专业的分析。回答要条理清晰，并引用可靠来源。',
		name: 'Moonshot AI'
	},
	zhipu: {
		model: 'ep-20241215223536-fb4sn',
		systemPrompt: '你是智谱 AI 助手，请基于联网搜索结果提供深入的见解和建议。回答要重点突出，并注明参考来源。',
		name: '智谱 AI'
	}
};

const API_KEY = 'da8a4250-7bce-493d-92b0-a12b2b4e4590';
const API_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

const contextMap = new Map();

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
		
		const response = await fetch(`${API_BASE}/chat/completions`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: modelConfig.model,
				messages: context,
				stream: true
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('No response body');
		}

		let assistantResponse = '';
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// 解码并处理数据块
			const chunk = new TextDecoder().decode(value);
			const lines = chunk.split('\n').filter(line => line.trim() !== '');

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					try {
						const data = JSON.parse(line.slice(6));
						if (data.choices && data.choices[0]?.delta?.content) {
							const content = data.choices[0].delta.content;
							assistantResponse += content;
							controller.enqueue(encoder.encode(JSON.stringify({
								model: modelConfig.model,
								modelName: modelConfig.name,
								content,
								references: data.references
							}) + '\n'));
						}
					} catch (e) {
						console.error('Error parsing chunk:', e);
					}
				}
			}
		}

		context.push({ role: 'assistant', content: assistantResponse });
		contextMap.set(`${sessionId}-${modelConfig.model}`, context);
		
	} catch (error) {
		console.error(`Error with model ${modelConfig.model}:`, error);
		controller.enqueue(encoder.encode(JSON.stringify({
			model: modelConfig.model,
			modelName: modelConfig.name,
			error: '处理请求时发生错误。'
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