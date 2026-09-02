import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { classes, enrollments, parents, parentStudents, students } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type { CreateParentDto, UpdateParentDto } from './parents.schema';
import { StudentRecord } from '@/modules/students/students.service';
import { ChatProvisioningService } from '@/modules/chat/chat-provisioning.service';

export type ParentRecord = typeof parents.$inferSelect;
export type ChildSummary = Pick<StudentRecord, 'id' | 'firstName' | 'lastName'>;

export class ParentsService {
  private readonly chatProvisioning = new ChatProvisioningService();

  async findAll(subSchoolId: string) {
    try {
      const rows = await db
        .select({
          parent: parents,
          student: {
            id: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
          },
        })
        .from(parents)
        .leftJoin(parentStudents, eq(parentStudents.parentId, parents.id))
        .leftJoin(students, eq(students.id, parentStudents.studentId))
        .where(eq(parents.subSchoolId, subSchoolId));

      const map = new Map<
        string,
        typeof parents.$inferSelect & {
          children: { id: string; firstName: string; lastName: string }[];
        }
      >();

      for (const row of rows) {
        if (!map.has(row.parent.id)) {
          map.set(row.parent.id, { ...row.parent, children: [] });
        }
        if (row.student?.id) {
          map
            .get(row.parent.id)!
            .children.push(row.student as { id: string; firstName: string; lastName: string });
        }
      }

      return [...map.values()];
    } catch (error) {
      throw new AppError('INTERNAL_ERROR', 'Erreur lors de la récupération des parents', 500);
    }
  }

  async findById(
    id: string,
    subSchoolId: string,
  ): Promise<ParentRecord & { children: ChildSummary[] }> {
    const [parent] = await db
      .select()
      .from(parents)
      .where(and(eq(parents.id, id), eq(parents.subSchoolId, subSchoolId)));
    if (!parent) throw new AppError('NOT_FOUND', 'Parent introuvable', 404);

    const rows = await db
      .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
      .from(parentStudents)
      .innerJoin(students, eq(students.id, parentStudents.studentId))
      .where(eq(parentStudents.parentId, id));

    return { ...parent, children: rows };
  }

  async create(input: CreateParentDto): Promise<ParentRecord & { children: ChildSummary[] }> {
    if (!input.userId) {
      throw new AppError('BAD_REQUEST', 'userId requis pour créer un parent', 400);
    }

    const result = await db.transaction(async (tx) => {
      const [parent] = await tx
        .insert(parents)
        .values({
          userId: input.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          gender: input.gender,
          isActive: input.isActive,
          subSchoolId: input.subSchoolId,
        })
        .returning();

      let children: ChildSummary[] = [];

      if (input.studentIds?.length) {
        const existing = await tx
          .select({ id: students.id, parentId: students.parentId })
          .from(students)
          .where(inArray(students.id, input.studentIds));

        const alreadyAssigned = existing.filter((s) => s.parentId !== null);
        if (alreadyAssigned.length) {
          throw new AppError('CONFLICT', 'Un ou plusieurs élèves ont déjà un parent assigné', 409);
        }

        await tx
          .insert(parentStudents)
          .values(input.studentIds.map((studentId) => ({ parentId: parent.id, studentId })))
          .onConflictDoNothing();

        await tx
          .update(students)
          .set({ parentId: parent.id })
          .where(inArray(students.id, input.studentIds));

        children = await tx
          .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
          .from(students)
          .where(inArray(students.id, input.studentIds));
      }

      return { parent, children };
    });

    if (input.studentIds?.length) {
      await this.provisionChatForNewParent(input.userId, result.parent.id, input.studentIds);
    }

    return { ...result.parent, children: result.children };
  }

  async update(id: string, subSchoolId: string, input: UpdateParentDto): Promise<ParentRecord> {
    await this.findById(id, subSchoolId);

    const [parent] = await db
      .update(parents)
      .set({
        ...input,
      })
      .where(and(eq(parents.id, id), eq(parents.subSchoolId, subSchoolId)))
      .returning();

    return parent;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(parents).where(and(eq(parents.id, id), eq(parents.subSchoolId, subSchoolId)));
  }

  private async provisionChatForNewParent(
    parentUserId: string,
    parentId: string,
    studentIds: string[],
  ) {
    const classLinks = await db
      .select({
        studentId: enrollments.studentId,
        classId: enrollments.classId,
        subSchoolId: classes.subSchoolId,
      })
      .from(enrollments)
      .innerJoin(classes, eq(classes.id, enrollments.classId))
      .where(inArray(enrollments.studentId, studentIds));

    for (const link of classLinks) {
      await this.chatProvisioning.onParentLinked(
        parentUserId,
        link.studentId,
        link.subSchoolId,
        link.classId,
      );
    }
  }
}
