export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId?: string;
  traceId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
  traceId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
