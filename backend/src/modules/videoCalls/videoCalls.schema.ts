import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createSessionSchema = z.object({
    conversationId: z.string().uuid('Invalid conversation ID').optional(),
});

export const sessionParamsSchema = z.object({
    sessionId: z.string().uuid('Invalid session ID'),
});

export const joinSessionSchema = z.object({
    userName: z.string().min(1, 'User name is required').max(150),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type SessionParamsDto = z.infer<typeof sessionParamsSchema>;
export type JoinSessionDto = z.infer<typeof joinSessionSchema>;