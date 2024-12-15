type SearchResult = {
  title: string;
  snippet: string;
  link: string;
};

export async function searchWeb(query: string): Promise<SearchResult[]> {
  // 这里你需要替换为实际的搜索 API 密钥和端点
  const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
  const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Search API request failed');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    }));
  } catch (error) {
    console.error('Search error:', error);
    return []; // 出错时返回空结果
  }
} 