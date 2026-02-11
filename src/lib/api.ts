export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
  details?: unknown;
};

export const ok = <T>(data?: T, message?: string): ApiResult<T> => ({
  ok: true,
  data,
  message
});

export const fail = (
  errorCode: string,
  message: string,
  details?: unknown
): ApiResult => ({
  ok: false,
  errorCode,
  message,
  details
});

export const safeRequestId = () =>
  `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
