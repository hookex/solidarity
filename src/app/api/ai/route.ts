import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: 'da8a4250-7bce-493d-92b0-a12b2b4e4590',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3', // 请确保这个 URL 是有效的
});

export async function POST(request: NextRequest) {  // 使用 POST 请求
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // 获取请求的 JSON 数据
    const { prompt } = await request.json();

    // 创建一个流对象
    const stream = new ReadableStream({
        async start(controller) {
            console.log('----- streaming request -----');
            try {
                // 发起 OpenAI 请求，确认返回的是流
                const openaiStream = await openai.chat.completions.create({
                    messages: [
                        { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
                        { role: 'user', content: prompt },
                    ],
                    model: 'ep-20241203130210-txrtw',
                    stream: true,
                });

                // 处理流数据
                for await (const part of openaiStream) {
                    const content = part.choices[0]?.delta?.content || '';
                    console.log('Stream chunk:', content); // 调试日志
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
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
