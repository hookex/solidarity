import { NextRequest, NextResponse } from 'next/server';

// 定义可用的模型配置
const AI_MODELS = {
	douBao: {
		model: 'bot-20241214140237-g9dqh',
		systemPrompt: '你是简洁的助手。回答限140字内，不确定的直接说不知道，别啰嗦，少废话。有信息来源要标注。',
		name: '豆包 AI',
		apiPath: '/bots/chat/completions',
		stream: false
	},
	bot: {
		model: 'ep-20241215223428-h6p4b',
		systemPrompt: '你是 Moonshot AI。回答限140字内，不确定就说不知道，别啰嗦，少废话。引用需标明来源。',
		name: 'Moonshot AI',
		apiPath: '/chat/completions',
		stream: true
	},
	zhipu: {
		model: 'ep-20241215223536-fb4sn',
		systemPrompt: '你是智谱助手。回答限140字内，不确定就说不知道，别啰嗦，少废话。重要信息标注来源。',
		name: '智谱 AI',
		apiPath: '/chat/completions',
		stream: true
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
		
		const requestBody = {
			model: modelConfig.model,
			messages: context,
			stream_options: {"include_usage": true},
			stream: modelConfig.stream
		};

		console.log(`${modelConfig.name} - Request:`, {
			url: `${API_BASE}${modelConfig.apiPath}`,
			body: requestBody
		});

		const response = await fetch(`${API_BASE}${modelConfig.apiPath}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		console.log(`${modelConfig.name} - Response status:`, response.status);
		console.log(`${modelConfig.name} - Response headers:`, Object.fromEntries(response.headers));

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
		}

		if (!modelConfig.stream) {
			const data = await response.json();
			console.log(`${modelConfig.name} - Response data:`, data);
			
			// 处理搜索状态
			if (data.metadata?.search_info) {
				const searchMessage = {
					model: modelConfig.model,
					modelName: modelConfig.name,
					content: '正在搜索相关信息...',
					type: 'search_status'
				};
				console.log(`${modelConfig.name} - Sending search status:`, searchMessage);
				controller.enqueue(encoder.encode(JSON.stringify(searchMessage) + '\n'));
			}
			
			// 处理思考状态
			if (data.metadata?.thinking_info) {
				const thinkingMessage = {
					model: modelConfig.model,
					modelName: modelConfig.name,
					content: '正在思考回答...',
					type: 'thinking_status'
				};
				console.log(`${modelConfig.name} - Sending thinking status:`, thinkingMessage);
				controller.enqueue(encoder.encode(JSON.stringify(thinkingMessage) + '\n'));
			}
			
			// 处理生成状态
			if (data.metadata?.generating_info) {
				const generatingMessage = {
					model: modelConfig.model,
					modelName: modelConfig.name,
					content: '正在生成回答...',
					type: 'generating_status'
				};
				console.log(`${modelConfig.name} - Sending generating status:`, generatingMessage);
				controller.enqueue(encoder.encode(JSON.stringify(generatingMessage) + '\n'));
			}
			
			const content = data.choices?.[0]?.message?.content || '';
			if (content) {
				const message = {
					model: modelConfig.model,
					modelName: modelConfig.name,
					content,
					references: data.references,
					type: 'answer'
				};
				console.log(`${modelConfig.name} - Sending message:`, message);
				controller.enqueue(encoder.encode(JSON.stringify(message) + '\n'));
			}
			
			context.push({ role: 'assistant', content });
			contextMap.set(`${sessionId}-${modelConfig.model}`, context);
			return;
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('No response body');
		}

		let assistantResponse = '';
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				console.log(`${modelConfig.name} - Stream complete, final response:`, assistantResponse);
				break;
			}

			// 解码并处理数据块
			const chunk = new TextDecoder().decode(value);
			console.log(`${modelConfig.name} - Raw chunk:`, chunk);
			
			const lines = chunk.split('\n').filter(line => line.trim() !== '');
			console.log(`${modelConfig.name} - Processed lines:`, lines);

			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const content = line.slice(6).trim();
					console.log(`${modelConfig.name} - Processing content:`, content);
					
					// 检查是否是结束标记
					if (content === '[DONE]') {
						console.log(`${modelConfig.name} - Received DONE signal`);
						continue;
					}

					try {
						const data = JSON.parse(content);
						console.log(`${modelConfig.name} - Parsed data:`, data);
						
						// 检查所有可能的响应格式
						const messageContent = data.choices?.[0]?.message?.content;
						const deltaContent = data.choices?.[0]?.delta?.content;
						
						if (messageContent || deltaContent) {
							const content = messageContent || deltaContent;
							assistantResponse += content;
							const message = {
								model: modelConfig.model,
								modelName: modelConfig.name,
								content,
								references: data.references
							};
							console.log(`${modelConfig.name} - Sending message:`, message);
							controller.enqueue(encoder.encode(JSON.stringify(message) + '\n'));
						} else {
							console.log(`${modelConfig.name} - No content found in response:`, data);
						}
					} catch (e) {
						console.error(`${modelConfig.name} - Error parsing chunk:`, e, 'Raw content:', content);
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
			error: error instanceof Error ? error.message : '处理请求时发生错误。'
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