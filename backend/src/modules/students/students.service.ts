import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { students } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateStudentDto, UpdateStudentDto } from './students.schema';

export type StudentRecord = typeof students.$inferSelect;

export class StudentsService {
  async findAll(schoolId: string): Promise<StudentRecord[]> {
    return db
      .select()
      .from(students)
      .where(
        and(
          eq(students.schoolId, schoolId),
        ),
      );
  }

  async findById(id: string, schoolId: string): Promise<StudentRecord> {
    const [student] = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.id, id),
          eq(students.schoolId, schoolId),
        ),
      );

    if (!student) {
      throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
    }

    return student;
  }

async create(input: CreateStudentDto): Promise<StudentRecord> {
    const [student] = await db
        .insert(students)
        .values({
            schoolId:       input.schoolId,
            parentId:       input.parentId,
            firstName:      input.firstName,
            lastName:       input.lastName,
            email:          input.email,
            phone:          input.phone,
            address:        input.address,
            gender:         input.gender,
            dateOfBirth:    input.dateOfBirth,
            enrollmentDate: input.enrollmentDate,
            isActive:       input.isActive,
        })
        .returning();

    return student;
}

  async update(
    id: string,
    schoolId: string,
    input: UpdateStudentDto,
  ): Promise<StudentRecord> {
    await this.findById(id, schoolId);

    const [student] = await db
      .update(students)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(students.id, id),
          eq(students.schoolId, schoolId),
        ),
      )
      .returning();

    return student;
  }

  async softDelete(id: string, schoolId: string): Promise<void> {
    await this.findById(id, schoolId);

    await db
      .update(students)
      .set({ deletedAt: new Date() })
      .where(
        and(
            eq(students.id, id),
            eq(students.schoolId, schoolId)
        ),
      );
  }
}
