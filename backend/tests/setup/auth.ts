import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { TokenPayload } from '@/modules/auth/auth.service';

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

export function bearer(payload: TokenPayload): string {
  return `Bearer ${signAccessToken(payload)}`;
}
