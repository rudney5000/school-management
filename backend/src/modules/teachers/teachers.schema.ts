import { z } from 'zod';

export const subSchoolQuerySchema = z.object({
  subSchoolId: z.string().uuid('Invalid school ID'),
});

export const contractTypeSchema = z.enum([
  'permanent',
  'fixed_term',
  'part_time'
]);
export const maritalStatusSchema = z.enum([
  'single',
  'married',
  'divorced',
  'widowed'
]);

export const createTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  image: z.string().url('Invalid image URL').optional(),
  maritalStatus: maritalStatusSchema.optional(),
  hasChildren: z.boolean().optional().default(false),
  childrenCount: z.number().int().min(0).optional().default(0),
  yearsOfExperience: z.number().int().min(0).optional().default(0),
});

const assignTeacherObjectSchema = z.object({
  subSchoolId: z.string().uuid('Invalid sub-school ID'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  contractType: contractTypeSchema.optional(),
  salary: z.string().optional(),
  weeklyHours: z.number().int().positive().optional(),
  subjectsTaught: z.string().optional(),
  contractClauses: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

function requiresContractEndDate(data: { contractType?: string; contractEndDate?: string }) {
  return data.contractType !== 'fixed_term' || !!data.contractEndDate;
}

export const assignTeacherSchema = assignTeacherObjectSchema.refine(
    requiresContractEndDate,
    { message: 'La date de fin est requise pour un CDD', path: ['contractEndDate'] }
);

export const updateTeacherSchema = createTeacherSchema
  .partial()

export const updateAssignmentSchema = assignTeacherObjectSchema
    .partial()
    .omit({ subSchoolId: true })
    .refine(
        requiresContractEndDate,
        { message: 'La date de fin est requise pour un CDD', path: ['contractEndDate'] }
    );

export const teacherParamsSchema = z.object({
  id: z.string().uuid('Invalid teacher ID'),
});

export const createTeacherWithAssignmentSchema = createTeacherSchema
    .merge(assignTeacherObjectSchema)
    .refine(
        requiresContractEndDate,
        { message: 'La date de fin est requise pour un CDD', path: ['contractEndDate'] }
    );

export type AssignTeacherDto = z.infer<typeof assignTeacherSchema>;
export type UpdateAssignmentDto = z.infer<typeof updateAssignmentSchema>;
export type SubSchoolQueryDto = z.infer<typeof subSchoolQuerySchema>;
export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
export type TeacherParamsDto = z.infer<typeof teacherParamsSchema>;
export type CreateTeacherWithAssignmentDto = z.infer<typeof createTeacherWithAssignmentSchema>;