export interface ApiMeta {
  [key: string]: unknown;
}
export interface ApiSuccessResponse<T> {
  // success: true;
  // data: T;
  // requestId?: string;
  // traceId?: string;
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
  requestId: string;
  traceId: string;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  meta?: ApiMeta;
  requestId: string;
  traceId: string;
  timestamp: string;
  path: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
