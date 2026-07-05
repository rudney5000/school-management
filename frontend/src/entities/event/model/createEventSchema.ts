import { z } from 'zod'
import { getErrorMessage } from '@shared/lib'
import {EventType} from "@entities/event";


export const createEventSchema = z.object({
    title: z.string().min(3, getErrorMessage('validation.maxLength20')),
    description: z.string().optional().or(z.literal('')),
    type: z.nativeEnum(EventType, {
        errorMap: () => ({ message: getErrorMessage('validation.invalidType') })
    }),
    startDate: z.string().min(1, getErrorMessage('validation.enrollmentDateRequired')),
    endDate: z.string().optional().or(z.literal('')),
    location: z.string().max(255, getErrorMessage('validation.maxLength255')).optional().or(z.literal('')),
    isPublic: z.boolean().default(true),
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    isLiveEvent: z
        .boolean()
        .optional(),
    liveUrl: z
        .string()
        .url(getErrorMessage('validation.invalidUrl'))
        .optional(),
});

export const updateEventSchema = createEventSchema
    .omit({ subSchoolId: true })
    .partial();

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
