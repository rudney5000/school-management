export type VideoCallParamsDto = {
    id: string
}

export type VideoCallListQueryDto = {
    subSchoolId: string
}

import { z } from 'zod';

export const createSessionSchema = z.object({
    conversationId: z.string().uuid().optional(),
});

export const sessionParamsSchema = z.object({
    sessionId: z.string().uuid(),
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type SessionParamsDto = z.infer<typeof sessionParamsSchema>;