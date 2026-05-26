import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { teachers } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateTeacherDto, UpdateTeacherDto } from './teachers.schema';

export type TeacherRecord = typeof teachers.$inferSelect;

export class TeachersService {
  async findAll(schoolId: string): Promise<TeacherRecord[]> {
    return db
      .select()
      .from(teachers)
      .where(eq(teachers.schoolId, schoolId));
  }

  async findById(id: string, schoolId: string): Promise<TeacherRecord> {
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(
        and(
          eq(teachers.id, id),
          eq(teachers.schoolId, schoolId),
        ),
      );

    if (!teacher) {
      throw new AppError('NOT_FOUND', 'Enseignant introuvable', 404);
    }

    return teacher;
  }

  async create(input: CreateTeacherDto): Promise<TeacherRecord> {
    const [teacher] = await db
      .insert(teachers)
      .values({
        schoolId: input.schoolId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        hireDate: input.hireDate,
        qualification: input.qualification,
        specialization: input.specialization,
      })
      .returning();

    return teacher;
  }

  async update(
    id: string,
    schoolId: string,
    input: UpdateTeacherDto,
  ): Promise<TeacherRecord> {
    await this.findById(id, schoolId);

    const [teacher] = await db
      .update(teachers)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teachers.id, id),
          eq(teachers.schoolId, schoolId),
        ),
      )
      .returning();

    return teacher;
  }

  async remove(id: string, schoolId: string): Promise<void> {
    await this.findById(id, schoolId);
    await db.delete(teachers).where(
      and(
        eq(teachers.id, id),
        eq(teachers.schoolId, schoolId),
      ),
    );
  }
}
