import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: 'da8a4250-7bce-493d-92b0-a12b2b4e4590',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});


export async function GET(request: NextRequest) {
    // Non-streaming:
    console.log('----- standard request -----')
    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
            { role: 'user', content: '常见的十字花科植物有哪些？' },
        ],
        model: 'ep-20241203130210-txrtw',
    });
    console.log(completion.choices[0]?.message?.content);

    // Streaming:
    console.log('----- streaming request -----')
    const stream = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: '你是豆包，是由字节跳动开发的 AI 人工智能助手' },
            { role: 'user', content: '常见的十字花科植物有哪些？' },
        ],
        model: 'ep-20241203130210-txrtw',
        stream: true,
    });

    let content = ''

    for await (const part of stream) {
        content += part.choices[0]?.delta?.content || ''
    }

    return NextResponse.json({ message: `result: ${content}` });
}