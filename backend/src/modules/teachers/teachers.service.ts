import {
    and,
    eq
} from 'drizzle-orm';
import { db } from '@/db';
import {
    attachments,
    teachers,
    teacherSchools
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    AssignTeacherDto,
    CreateTeacherWithAssignmentDto,
    UpdateAssignmentDto,
    UpdateTeacherDto
} from './teachers.schema';

const REQUIRED_TEACHER_CATEGORIES = [
    'identity_document',
    'diploma',
    'criminal_record',
    'resume',
    'medical_certificate',
] as const

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
    image: string | null;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | null;
    hasChildren: boolean | null;
    childrenCount: number | null;
    yearsOfExperience: number | null;
    subSchoolId: string;
    hireDate: string;
    contractEndDate: string | null;
    contractType: 'permanent' | 'fixed_term' | 'part_time' | null;
    salary: string | null;
    weeklyHours: number | null;
    subjectsTaught: string | null;
    contractClauses: string | null;
    qualification: string | null;
    specialization: string | null;
    isActive: boolean;
};

const teacherWithAssignmentColumns = {
    id: teachers.id,
    firstName: teachers.firstName,
    lastName: teachers.lastName,
    email: teachers.email,
    phone: teachers.phone,
    address: teachers.address,
    gender: teachers.gender,
    dateOfBirth: teachers.dateOfBirth,
    image: teachers.image,
    maritalStatus: teachers.maritalStatus,
    hasChildren: teachers.hasChildren,
    childrenCount: teachers.childrenCount,
    yearsOfExperience: teachers.yearsOfExperience,
    subSchoolId: teacherSchools.subSchoolId,
    hireDate: teacherSchools.hireDate,
    contractEndDate: teacherSchools.contractEndDate,
    contractType: teacherSchools.contractType,
    salary: teacherSchools.salary,
    weeklyHours: teacherSchools.weeklyHours,
    subjectsTaught: teacherSchools.subjectsTaught,
    contractClauses: teacherSchools.contractClauses,
    qualification: teacherSchools.qualification,
    specialization: teacherSchools.specialization,
    isActive: teacherSchools.isActive,
} as const;

export class TeachersService {
    async findAll(subSchoolId: string): Promise<TeacherWithAssignment[]> {
        return db
            .select(teacherWithAssignmentColumns)
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
            .select(teacherWithAssignmentColumns)
            .from(teacherSchools)
            .innerJoin(teachers, eq(teacherSchools.teacherId, teachers.id))
            .where(
                and(
                    eq(teachers.id, id),
                    eq(teacherSchools.subSchoolId, subSchoolId),
                ),
            );

        if (!row) throw new AppError(
            'NOT_FOUND',
            'Enseignant introuvable',
            404
        );
        return row;
    }

    async create(input: CreateTeacherWithAssignmentDto): Promise<TeacherWithAssignment> {
        const teacherId = await db.transaction(async (tx) => {
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
                    enrollmentDate: input.enrollmentDate,
                    image: input.image,
                    maritalStatus: input.maritalStatus,
                    hasChildren: input.hasChildren,
                    childrenCount: input.childrenCount,
                    yearsOfExperience: input.yearsOfExperience,
                })
                .returning();

            await tx.insert(teacherSchools).values({
                teacherId: teacher.id,
                subSchoolId: input.subSchoolId,
                hireDate: input.hireDate,
                contractEndDate: input.contractEndDate,
                contractType: input.contractType,
                salary: input.salary?.toString(),
                weeklyHours: input.weeklyHours,
                subjectsTaught: input.subjectsTaught,
                contractClauses: input.contractClauses,
                qualification: input.qualification,
                specialization: input.specialization,
                isActive: input.isActive,
            });

            return teacher.id;
        });

        return this.findById(teacherId, input.subSchoolId);
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
            .set({
                ...input,
                salary: input.salary !== undefined ? input.salary?.toString() : undefined,
            })
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
                contractEndDate: input.contractEndDate,
                contractType: input.contractType,
                salary: input.salary?.toString(),
                weeklyHours: input.weeklyHours,
                subjectsTaught: input.subjectsTaught,
                contractClauses: input.contractClauses,
                qualification: input.qualification,
                specialization: input.specialization,
                isActive: input.isActive,
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

    async getDossierStatus(teacherId: string, subSchoolId: string) {
        await this.findById(teacherId, subSchoolId)

        const docs = await db
            .select({ category: attachments.category, status: attachments.status })
            .from(attachments)
            .where(and(
                eq(attachments.attachableType, 'teacher'),
                eq(attachments.attachableId, teacherId),
            ))

        const validatedCategories = new Set(
            docs.filter((d) => d.status === 'validated').map((d) => d.category),
        )
        const missing = REQUIRED_TEACHER_CATEGORIES.filter((c) => !validatedCategories.has(c))

        return { isComplete: missing.length === 0, missing }
    }

    async ensureTeacherDossierComplete(teacherId: string, subSchoolId: string): Promise<void> {
        const { isComplete, missing } = await this.getDossierStatus(teacherId, subSchoolId)
        if (!isComplete) {
            throw new AppError(
                'DOCUMENTS_INCOMPLETE',
                `Dossier incomplet : ${missing.join(', ')}`,
                422
            )
        }
    }

}
