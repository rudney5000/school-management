import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const createLiveSessionSchema = z.object({
    courseId: z.string().uuid('Invalid course ID').optional(),
    classId: z.string().uuid('Invalid class ID').optional(),
    scheduleId: z.string().uuid('Invalid schedule ID').optional(),
    eventId: z.string().uuid('Invalid event ID').optional(),
    examId: z.string().uuid('Invalid exam ID').optional(),
    conversationId: z.string().uuid('Invalid conversation ID').optional(),
    scheduledAt: z.string().datetime().optional(),
}).refine(
    (data) => {
        const links = [data.courseId, data.classId, data.scheduleId, data.eventId, data.examId, data.conversationId];
        return links.filter(Boolean).length <= 1;
    },
    { message: 'Provide exactly one of courseId or classId' }
);

export const liveSessionParamsSchema = z.object({
    sessionId: z.string().uuid('Invalid session ID'),
});

export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateLiveSessionDto = z.infer<typeof createLiveSessionSchema>;
export type LiveSessionParamsDto = z.infer<typeof liveSessionParamsSchema>;