import {and, between, eq, gte, lte, sql} from 'drizzle-orm';
import {db} from '@/db';
import {studentAttendances, teacherAttendances} from '@/db/schema';
import {AppError} from '@/shared/errors/app-error';
import {
    AttendanceQueryDto,
    BulkUpsertStudentAttendanceDto,
    BulkUpsertTeacherAttendanceDto,
    CreateStudentAttendanceDto,
    CreateTeacherAttendanceDto,
    UpdateStudentAttendanceDto,
    UpdateTeacherAttendanceDto
} from "@/modules/attendances/attendances.schema";

export type StudentAttendanceRecord = typeof studentAttendances.$inferSelect;
export type TeacherAttendanceRecord = typeof teacherAttendances.$inferSelect;

export type PaginatedResult<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
};

export class StudentAttendanceService {

    async findAll(query: AttendanceQueryDto): Promise<PaginatedResult<StudentAttendanceRecord>> {
        const { subSchoolId, from, to, status, page, limit } = query;
        const offset = (page - 1) * limit;

        const conditions = [eq(studentAttendances.subSchoolId, subSchoolId)];
        if (from && to)  conditions.push(between(studentAttendances.date, from, to));
        else if (from)   conditions.push(gte(studentAttendances.date, from));
        else if (to)     conditions.push(lte(studentAttendances.date, to));
        if (status)      conditions.push(eq(studentAttendances.status, status));

        const [rows, [{ total }]] = await Promise.all([
            db
                .select()
                .from(studentAttendances)
                .where(and(...conditions))
                .limit(limit)
                .offset(offset),
            db
                .select({ total: sql<number>`count(*)::int` })
                .from(studentAttendances)
                .where(and(...conditions)),
        ]);

        return { data: rows, total, page, limit };
    }

    async findById(id: string, subSchoolId: string): Promise<StudentAttendanceRecord> {
        const [row] = await db
            .select()
            .from(studentAttendances)
            .where(
                and(
                    eq(studentAttendances.id, id),
                    eq(studentAttendances.subSchoolId, subSchoolId),
                ),
            );

        if (!row) {
            throw new AppError('NOT_FOUND', 'Présence introuvable', 404);
        }

        return row;
    }

    async create(input: CreateStudentAttendanceDto): Promise<StudentAttendanceRecord> {
        const [row] = await db
            .insert(studentAttendances)
            .values({
                subSchoolId: input.subSchoolId,
                studentId:   input.studentId,
                classId:     input.classId,
                courseId:    input.courseId,
                teacherId:   input.teacherId,
                date:        input.date,
                status:      input.status,
                reason:      input.reason,
                note:        input.note,
            })
            .returning();

        return row;
    }

    async bulkUpsert(input: BulkUpsertStudentAttendanceDto): Promise<StudentAttendanceRecord[]> {
        const { subSchoolId, date, records } = input;

        const globalRecords = records.filter(r => !r.courseId)
        const courseRecords = records.filter(r => !!r.courseId)

        const results: StudentAttendanceRecord[] = []

        if (globalRecords.length > 0) {
            const rows = await db
                .insert(studentAttendances)
                .values(globalRecords.map(r => ({ subSchoolId, date, ...r, courseId: null })))
                .onConflictDoUpdate({
                    target: [studentAttendances.studentId, studentAttendances.date],
                    targetWhere: sql`${studentAttendances.courseId} IS NULL`,
                    set: {
                        status:  sql`excluded.status`,
                        reason:  sql`excluded.reason`,
                        notedAt: new Date(),
                    },
                })
                .returning()
            results.push(...rows)
        }

        if (courseRecords.length > 0) {
            const rows = await db
                .insert(studentAttendances)
                .values(courseRecords.map(r => ({ subSchoolId, date, ...r })))
                .onConflictDoUpdate({
                    target: [
                        studentAttendances.studentId,
                        studentAttendances.date,
                        studentAttendances.courseId,
                    ],
                    targetWhere: sql`${studentAttendances.courseId} IS NOT NULL`,
                    set: {
                        status:  sql`excluded.status`,
                        reason:  sql`excluded.reason`,
                        notedAt: new Date(),
                    },
                })
                .returning()
            results.push(...rows)
        }

        return results
    }

    async update(
        id: string,
        subSchoolId: string,
        input: UpdateStudentAttendanceDto,
    ): Promise<StudentAttendanceRecord> {
        await this.findById(id, subSchoolId);

        const [row] = await db
            .update(studentAttendances)
            .set({ ...input })
            .where(
                and(
                    eq(studentAttendances.id, id),
                    eq(studentAttendances.subSchoolId, subSchoolId),
                ),
            )
            .returning();

        return row;
    }

    async delete(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId);

        await db
            .delete(studentAttendances)
            .where(
                and(
                    eq(studentAttendances.id, id),
                    eq(studentAttendances.subSchoolId, subSchoolId),
                ),
            );
    }
}

export class TeacherAttendanceService {

    async findAll(query: AttendanceQueryDto): Promise<PaginatedResult<TeacherAttendanceRecord>> {
        const { subSchoolId, from, to, status, page, limit } = query;
        const offset = (page - 1) * limit;

        const conditions = [eq(teacherAttendances.subSchoolId, subSchoolId)];
        if (from && to)  conditions.push(between(teacherAttendances.date, from, to));
        else if (from)   conditions.push(gte(teacherAttendances.date, from));
        else if (to)     conditions.push(lte(teacherAttendances.date, to));
        if (status)      conditions.push(eq(teacherAttendances.status, status));

        const [rows, [{ total }]] = await Promise.all([
            db
                .select()
                .from(teacherAttendances)
                .where(and(...conditions))
                .limit(limit)
                .offset(offset),
            db
                .select({ total: sql<number>`count(*)::int` })
                .from(teacherAttendances)
                .where(and(...conditions)),
        ]);

        return { data: rows, total, page, limit };
    }

    async findById(id: string, subSchoolId: string): Promise<TeacherAttendanceRecord> {
        const [row] = await db
            .select()
            .from(teacherAttendances)
            .where(
                and(
                    eq(teacherAttendances.id, id),
                    eq(teacherAttendances.subSchoolId, subSchoolId),
                ),
            );

        if (!row) {
            throw new AppError('NOT_FOUND', 'Présence enseignant introuvable', 404);
        }

        return row;
    }

    async create(input: CreateTeacherAttendanceDto): Promise<TeacherAttendanceRecord> {
        const [row] = await db
            .insert(teacherAttendances)
            .values({
                subSchoolId: input.subSchoolId,
                teacherId:   input.teacherId,
                date:        input.date,
                status:      input.status,
                reason:      input.reason,
            })
            .returning();

        return row;
    }

    async bulkUpsert(input: BulkUpsertTeacherAttendanceDto): Promise<TeacherAttendanceRecord[]> {
        const { subSchoolId, date, records } = input;

        return db
            .insert(teacherAttendances)
            .values(
                records.map((r) => ({
                    subSchoolId,
                    date,
                    teacherId: r.teacherId,
                    status: r.status,
                    reason: r.reason ?? null,
                })),
            )
            .onConflictDoUpdate({
                target: [teacherAttendances.teacherId, teacherAttendances.date],
                set: {
                    status: sql`excluded.status`,
                    reason: sql`excluded.reason`,
                    notedAt: new Date(),
                },
            })
            .returning();
    }

    async update(
        id: string,
        subSchoolId: string,
        input: UpdateTeacherAttendanceDto,
    ): Promise<TeacherAttendanceRecord> {
        await this.findById(id, subSchoolId);

        const [row] = await db
            .update(teacherAttendances)
            .set({ ...input })
            .where(
                and(
                    eq(teacherAttendances.id, id),
                    eq(teacherAttendances.subSchoolId, subSchoolId),
                ),
            )
            .returning();

        return row;
    }

    async delete(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId);

        await db
            .delete(teacherAttendances)
            .where(
                and(
                    eq(teacherAttendances.id, id),
                    eq(teacherAttendances.subSchoolId, subSchoolId),
                ),
            );
    }
}