import type { Response } from 'express';

type SuccessResponse<T> = {
  success: true;
  data: T;
};

export function respond<T>(res: Response, data: T, status = 200): void {
  const body: SuccessResponse<T> = { success: true, data };
  res.status(status).json(body);
}
