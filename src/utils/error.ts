import { AxiosError } from 'axios';

export type AppErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;
  userMessage: string;
  statusCode?: number;
  field?: string;
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out',
          userMessage: 'Request timed out. Please try again.',
        };
      }
      return {
        code: 'NETWORK',
        message: 'Network error',
        userMessage: 'No internet connection. Please check your network.',
      };
    }

    const status = error.response.status;
    switch (status) {
      case 400:
        return {
          code: 'VALIDATION',
          message: error.response.data?.message ?? 'Validation error',
          userMessage: error.response.data?.message ?? 'Please check your input.',
          statusCode: status,
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          userMessage: 'Your session has expired. Please sign in again.',
          statusCode: status,
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'Forbidden',
          userMessage: "You don't have permission to do this.",
          statusCode: status,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'Not found',
          userMessage: 'The requested item no longer exists.',
          statusCode: status,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: 'Conflict',
          userMessage: error.response.data?.message ?? 'A conflict occurred.',
          statusCode: status,
        };
      default:
        return {
          code: 'SERVER_ERROR',
          message: `Server error ${status}`,
          userMessage: 'Something went wrong on our end. Please try again later.',
          statusCode: status,
        };
    }
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
      userMessage: 'Something went wrong. Please try again.',
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'Unknown error',
    userMessage: 'Something went wrong. Please try again.',
  };
}

export function isNetworkError(error: AppError): boolean {
  return error.code === 'NETWORK';
}

export function isAuthError(error: AppError): boolean {
  return error.code === 'UNAUTHORIZED';
}
