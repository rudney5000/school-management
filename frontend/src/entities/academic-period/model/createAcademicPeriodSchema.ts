import { z } from 'zod'
import {AcademicPeriodType} from './types'
import {getErrorMessage} from "@shared/lib";

export const createAcademicPeriodSchema = z.object({
    subSchoolId: z.string().uuid(getErrorMessage('validation.invalidUuid')),
    name:      z.string().min(2, 'Minimum 2 caractères').max(100),
    type:      z.nativeEnum(AcademicPeriodType, { message: 'Type de période invalide' }),
    startDate: z.string().min(1, 'Date de début requise'),
    endDate:   z.string().min(1, 'Date de fin requise'),
    isCurrent: z.boolean().default(false),
}).refine(d => new Date(d.endDate) > new Date(d.startDate), {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
})

export const updateAcademicPeriodSchema = z.object({
    name:      z.string().min(2).max(100).optional(),
    type:      z.nativeEnum(AcademicPeriodType).optional(),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
    isCurrent: z.boolean().optional(),
}).refine(d => {
    if (d.startDate && d.endDate) return new Date(d.endDate) > new Date(d.startDate)
    return true
}, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
})

export type CreateAcademicPeriodDto = z.infer<typeof createAcademicPeriodSchema>
export type UpdateAcademicPeriodDto = z.infer<typeof updateAcademicPeriodSchema>
