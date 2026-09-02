import { AppError } from '@/shared/errors/app-error';
import { reports } from '@/db/schema/reports';
import { eq } from 'drizzle-orm';
import { db } from '@/db';

export interface AttachmentContext {
  subSchoolId: string;
}

export interface AttachmentContextResolver {
  resolve(userId: string, userRole: string, attachableId: string): Promise<AttachmentContext>;
}

export class ReportAttachmentResolver implements AttachmentContextResolver {
  async resolve(
    userId: string,
    userRole: string,
    attachableId: string,
  ): Promise<AttachmentContext> {
    const [report] = await db
      .select({
        subSchoolId: reports.subSchoolId,
        reporterId: reports.reporterId,
      })
      .from(reports)
      .where(eq(reports.id, attachableId));

    if (!report) {
      throw new AppError('NOT_FOUND', 'Signalement introuvable', 404);
    }

    const isManager = ['admin', 'director', 'super_admin'].includes(userRole);
    const isReporter = report.reporterId === userId;

    if (!isManager && !isReporter) {
      throw new AppError(
        'FORBIDDEN',
        "Vous n'êtes pas autorisé à joindre un document à ce signalement",
        403,
      );
    }

    return { subSchoolId: report.subSchoolId };
  }
}
