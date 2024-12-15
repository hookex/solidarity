/**
 * API 响应类型
 */
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

/**
 * AI 搜索请求参数类型
 */
type AISearchParams = {
  sessionId: string;
  prompt: string;
  context: any[];
};

/**
 * AI API 服务类
 */
export class AIService {
  private static readonly API_BASE = '/api';

  /**
   * 处理流式响应的 AI 搜索请求
   * @param params - 请求参数
   * @param onChunk - 处理每个数据块的回调函数
   */
  static async searchStream(
    params: AISearchParams,
    onChunk: (modelId: string, chunk: string) => void
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.API_BASE}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunks = decoder.decode(value).split('\n');
        for (const chunk of chunks) {
          if (chunk) {
            try {
              const { model, content, error } = JSON.parse(chunk);
              if (content || error) {
                onChunk(model, content || error);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      return { data: undefined };
    } catch (error) {
      console.error('AI search error:', error);
      return {
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}

/**
 * 工具函数：生成唯一ID
 */
export const generateId = () => Math.floor(Math.random() * 1000000);

/**
 * 工具函数：获取当前时间戳
 */
export const getCurrentTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}; 