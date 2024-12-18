// 通用 API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// 通用分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 通用排序参数
export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
} 