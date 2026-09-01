import { and, eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { teacherSchools } from '@/db/schema/teacher';
import { AppError } from '@/shared/errors/app-error';
import { AttachmentContextResolver } from '@/shared/utils/resolvers/attachments/attachment-context-resolver';
import { assertTeacherScopeAccess } from '@/shared/utils/assert-teacher-scope-access';

export class TeacherAttachmentResolver implements AttachmentContextResolver {
  async resolve(userId: string, userRole: string, teacherId: string) {
    const [assignment] = await db
      .select({ subSchoolId: teacherSchools.subSchoolId })
      .from(teacherSchools)
      .where(and(eq(teacherSchools.teacherId, teacherId), eq(teacherSchools.isActive, true)))
      .orderBy(desc(teacherSchools.createdAt))
      .limit(1);

    if (!assignment) {
      throw new AppError('NOT_FOUND', 'Aucune affectation active pour cet enseignant', 404);
    }

    await assertTeacherScopeAccess({
      userId,
      userRole,
      teacherId,
      subSchoolId: assignment.subSchoolId,
    });

    return { subSchoolId: assignment.subSchoolId };
  }
}
