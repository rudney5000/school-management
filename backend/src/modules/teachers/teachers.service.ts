import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {teachers, teacherSchools} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    AssignTeacherDto,
    CreateTeacherWithAssignmentDto, UpdateAssignmentDto,
    UpdateTeacherDto
} from './teachers.schema';

export type TeacherRecord = typeof teachers.$inferSelect;

export type TeacherWithAssignment = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    gender: 'male' | 'female';
    dateOfBirth: string;
    hireDate: string;
    qualification: string | null;
    specialization: string | null;
    isActive: boolean;
};

export class TeachersService {
    async findAll(subSchoolId: string): Promise<TeacherWithAssignment[]> {
        return db
            .select({
                id: teachers.id,
                firstName: teachers.firstName,
                lastName: teachers.lastName,
                email: teachers.email,
                phone: teachers.phone,
                address: teachers.address,
                gender: teachers.gender,
                dateOfBirth: teachers.dateOfBirth,
                hireDate: teacherSchools.hireDate,
                qualification: teacherSchools.qualification,
                specialization: teacherSchools.specialization,
                isActive: teacherSchools.isActive,
            })
            .from(teacherSchools)
            .innerJoin(teachers, eq(teacherSchools.teacherId, teachers.id))
            .where(
                and(
                    eq(teacherSchools.subSchoolId, subSchoolId),
                    eq(teacherSchools.isActive, true),
                ),
            );
    }

    async findById(id: string, subSchoolId: string): Promise<TeacherWithAssignment> {
        const [row] = await db
            .select({
                id: teachers.id,
                firstName: teachers.firstName,
                lastName: teachers.lastName,
                email: teachers.email,
                phone: teachers.phone,
                address: teachers.address,
                gender: teachers.gender,
                dateOfBirth: teachers.dateOfBirth,
                hireDate: teacherSchools.hireDate,
                qualification: teacherSchools.qualification,
                specialization: teacherSchools.specialization,
                isActive: teacherSchools.isActive,
            })
            .from(teacherSchools)
            .innerJoin(teachers, eq(teacherSchools.teacherId, teachers.id))
            .where(
                and(
                    eq(teachers.id, id),
                    eq(teacherSchools.subSchoolId, subSchoolId),
                ),
            );

        if (!row) throw new AppError('NOT_FOUND', 'Enseignant introuvable', 404);
        return row;
    }

    async create(input: CreateTeacherWithAssignmentDto): Promise<TeacherWithAssignment> {
        await db.transaction(async (tx) => {
            const [teacher] = await tx
                .insert(teachers)
                .values({
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    phone: input.phone,
                    address: input.address,
                    gender: input.gender,
                    dateOfBirth: input.dateOfBirth,
                })
                .returning();

            await tx.insert(teacherSchools).values({
                teacherId: teacher.id,
                subSchoolId: input.subSchoolId,
                hireDate: input.hireDate,
                qualification: input.qualification,
                specialization: input.specialization,
            });
        });

        return this.findById(input.subSchoolId, input.subSchoolId);
    }

    async update(id: string, subSchoolId: string, input: UpdateTeacherDto): Promise<TeacherWithAssignment> {
        await this.findById(id, subSchoolId);

        await db
            .update(teachers)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(teachers.id, id));

        return this.findById(id, subSchoolId);
    }

    async updateAssignment(id: string, subSchoolId: string, input: UpdateAssignmentDto): Promise<TeacherWithAssignment> {
        await this.findById(id, subSchoolId);

        await db
            .update(teacherSchools)
            .set(input)
            .where(
                and(
                    eq(teacherSchools.teacherId, id),
                    eq(teacherSchools.subSchoolId, subSchoolId),
                ),
            );

        return this.findById(id, subSchoolId);
    }

    async assignToSchool(teacherId: string, input: AssignTeacherDto) {
        const [assignment] = await db
            .insert(teacherSchools)
            .values({
                teacherId,
                subSchoolId: input.subSchoolId,
                hireDate: input.hireDate,
                qualification: input.qualification,
                specialization: input.specialization,
            })
            .returning();

        return assignment;
    }
    async remove(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId);

        await db
            .update(teacherSchools)
            .set({ isActive: false })
            .where(
                and(
                    eq(teacherSchools.teacherId, id),
                    eq(teacherSchools.subSchoolId, subSchoolId),
                ),
            );
    }

}
