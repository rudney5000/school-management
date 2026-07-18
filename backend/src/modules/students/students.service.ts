import {
    and,
    eq,
    isNull} from 'drizzle-orm';
import { db } from '@/db';
import {
    parentStudents,
    students
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    CreateStudentDto,
    UpdateStudentDto
} from './students.schema';

export type StudentRecord = typeof students.$inferSelect;

export class StudentsService {
  async findAll(subSchoolId: string): Promise<StudentRecord[]> {
    return db
      .select()
      .from(students)
      .where(
        and(
          eq(students.subSchoolId, subSchoolId),
            isNull(students.deletedAt)
        ),
      );
  }

  async findById(id: string, subSchoolId: string): Promise<StudentRecord> {
    const [student] = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.id, id),
          eq(students.subSchoolId, subSchoolId),
        ),
      );

    if (!student) {
      throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
    }

    return student;
  }

    async findUnassigned(subSchoolId: string): Promise<StudentRecord[]> {
        return db.select().from(students).where(
            and(
                eq(students.subSchoolId, subSchoolId),
                isNull(students.parentId),
                isNull(students.deletedAt),
            ),
        );
    }

    async create(input: CreateStudentDto): Promise<StudentRecord> {
        return db.transaction(async (tx) => {
            const [student] = await tx.insert(students).values({
                subSchoolId: input.subSchoolId,
                parentId: input.parentId,
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                phone: input.phone,
                address: input.address,
                gender: input.gender,
                dateOfBirth: input.dateOfBirth,
                enrollmentDate: input.enrollmentDate,
                isActive: input.isActive,
            }).returning();

            if (input.parentId) {
                await tx.insert(parentStudents)
                    .values({ parentId: input.parentId, studentId: student.id })
                    .onConflictDoNothing();
            }

            return student;
        });
    }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateStudentDto,
  ): Promise<StudentRecord> {
    await this.findById(id, subSchoolId);

    const [student] = await db
      .update(students)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(students.id, id),
          eq(students.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return student;
  }

  async softDelete(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);

    await db
      .update(students)
      .set({ deletedAt: new Date() })
      .where(
        and(
            eq(students.id, id),
            eq(students.subSchoolId, subSchoolId)
        ),
      );
  }
}
