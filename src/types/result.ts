// src/types/result.ts
export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
