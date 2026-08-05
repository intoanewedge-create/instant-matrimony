export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function returnSuccess<T>(data: T): Result<T> {
  return {
    success: true,
    data,
  };
}

export function returnFailure<T = any>(error: string, code?: string): Result<T> {
  return {
    success: false,
    error,
    code,
  };
}
