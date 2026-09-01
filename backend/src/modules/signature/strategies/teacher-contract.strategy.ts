import { eq, and } from 'drizzle-orm';
import { createHash } from 'crypto';
import { db } from '@/db';
import { teacherSchools, attachments } from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import { TeachersService } from '@/modules/teachers/teachers.service';
import type {
  DocumentSignatureStrategy,
  TeacherContractSignDto,
} from '@/modules/signature/document-signature.schema';

const teachersService = new TeachersService();

export const teacherContractSignatureStrategy: DocumentSignatureStrategy<'teacher_contract'> = {
  allowedSignerRoles: ['director', 'admin'],

  async resolveScope({ subSchoolId, teacherId }: TeacherContractSignDto) {
    const [assignment] = await db
      .select({ id: teacherSchools.id })
      .from(teacherSchools)
      .where(
        and(eq(teacherSchools.teacherId, teacherId), eq(teacherSchools.subSchoolId, subSchoolId)),
      )
      .limit(1);

    if (!assignment) {
      throw new AppError('NOT_FOUND', 'Affectation introuvable', 404);
    }

    return {
      documentType: 'teacher_contract',
      documentId: assignment.id,
      subSchoolId,
    };
  },

  async assertReadyToSign({ documentId, subSchoolId }) {
    const [assignment] = await db
      .select({ teacherId: teacherSchools.teacherId })
      .from(teacherSchools)
      .where(eq(teacherSchools.id, documentId!))
      .limit(1);

    if (!assignment) {
      throw new AppError('NOT_FOUND', 'Affectation introuvable', 404);
    }

    await teachersService.ensureTeacherDossierComplete(assignment.teacherId, subSchoolId);
  },

  async computeContentHash({ documentId }) {
    const [assignment] = await db
      .select()
      .from(teacherSchools)
      .where(eq(teacherSchools.id, documentId!));

    if (!assignment) {
      throw new AppError('NOT_FOUND', 'Affectation introuvable', 404);
    }

    const validatedDocs = await db
      .select({ category: attachments.category, key: attachments.key })
      .from(attachments)
      .where(
        and(
          eq(attachments.attachableType, 'teacher'),
          eq(attachments.attachableId, assignment.teacherId),
          eq(attachments.status, 'validated'),
        ),
      )
      .orderBy(attachments.category);

    const normalized = JSON.stringify({ assignment, validatedDocs });
    return createHash('sha256').update(normalized).digest('hex');
  },
};
