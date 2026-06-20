import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const attendanceStatus = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

export const studentAttendanceParamsSchema = z.object({
    id: z.string().uuid('Invalid attendance ID'),
});

export const teacherAttendanceParamsSchema = z.object({
    id: z.string().uuid('Invalid attendance ID'),
});

export const subSchoolQuerySchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
});

export const attendanceQuerySchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
    from:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
    to:          z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
    status:      z.enum(attendanceStatus).optional(),
    page:        z.coerce.number().int().positive().default(1),
    limit:       z.coerce.number().int().positive().max(100).default(20),
});

export const createStudentAttendanceSchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
    studentId:   z.string().uuid('Invalid student ID'),
    classId:     z.string().uuid('Invalid class ID').optional(),
    courseId:    z.string().uuid('Invalid course ID').optional(),
    teacherId:   z.string().uuid('Invalid teacher ID').optional(),
    date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
    status:      z.enum(attendanceStatus),
    reason:      z.string().max(500).optional(),
    note:        z.string().max(500).optional(),
});

export const updateStudentAttendanceSchema = createStudentAttendanceSchema
    .partial()
    .omit({ subSchoolId: true, studentId: true, date: true });

export const bulkUpsertStudentAttendanceSchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
    date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
    records: z.array(
        z.object({
            studentId: z.string().uuid('Invalid student ID'),
            classId:   z.string().uuid('Invalid class ID').optional(),
            courseId:  z.string().uuid('Invalid course ID').optional(),
            teacherId: z.string().uuid('Invalid teacher ID').optional(),
            status:    z.enum(attendanceStatus),
            reason:    z.string().max(500).optional(),
            note:      z.string().max(500).optional(),
        })
    ).min(1).max(200),
});

export const createTeacherAttendanceSchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
    teacherId:   z.string().uuid('Invalid teacher ID'),
    date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
    status:      z.enum(attendanceStatus),
    reason:      z.string().max(500).optional(),
});

export const updateTeacherAttendanceSchema = createTeacherAttendanceSchema
    .partial()
    .omit({ subSchoolId: true, teacherId: true, date: true });

export const bulkUpsertTeacherAttendanceSchema = z.object({
    subSchoolId: z.string().uuid('Invalid sub-school ID'),
    date:        z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
    records: z.array(
        z.object({
            teacherId: z.string().uuid('Invalid teacher ID'),
            status:    z.enum(attendanceStatus),
            reason:    z.string().max(500).optional(),
        })
    ).min(1).max(200),
});

export type SubSchoolQueryDto                = z.infer<typeof subSchoolQuerySchema>;
export type AttendanceQueryDto               = z.infer<typeof attendanceQuerySchema>;

export type CreateStudentAttendanceDto       = z.infer<typeof createStudentAttendanceSchema>;
export type UpdateStudentAttendanceDto       = z.infer<typeof updateStudentAttendanceSchema>;
export type BulkUpsertStudentAttendanceDto   = z.infer<typeof bulkUpsertStudentAttendanceSchema>;

export type CreateTeacherAttendanceDto       = z.infer<typeof createTeacherAttendanceSchema>;
export type UpdateTeacherAttendanceDto       = z.infer<typeof updateTeacherAttendanceSchema>;
export type BulkUpsertTeacherAttendanceDto   = z.infer<typeof bulkUpsertTeacherAttendanceSchema>;

export type StudentAttendanceParamsDto       = z.infer<typeof studentAttendanceParamsSchema>;
export type TeacherAttendanceParamsDto       = z.infer<typeof teacherAttendanceParamsSchema>;