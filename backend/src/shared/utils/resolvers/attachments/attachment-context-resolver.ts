import { AppError } from '@/shared/errors/app-error';
import { reports } from '@/db/schema/reports';
import { users } from '@/db/schema/users';
import { workers } from '@/db/schema/workers';
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

    const isReporter = report.reporterId === userId;
    const allowed =
      isReporter || (await this.managesSubSchool(userId, userRole, report.subSchoolId));

    if (!allowed) {
      throw new AppError(
        'FORBIDDEN',
        "Vous n'êtes pas autorisé à joindre un document à ce signalement",
        403,
      );
    }

    return { subSchoolId: report.subSchoolId };
  }

  /**
   * A manager role alone is not enough: an admin or director only manages the
   * sub-school of their own worker record. Only `super_admin` spans schools.
   */
  private async managesSubSchool(
    userId: string,
    userRole: string,
    subSchoolId: string,
  ): Promise<boolean> {
    if (userRole === 'super_admin') return true;
    if (!['admin', 'director'].includes(userRole)) return false;

    const [row] = await db
      .select({ subSchoolId: workers.subSchoolId })
      .from(users)
      .innerJoin(workers, eq(workers.id, users.workerId))
      .where(eq(users.id, userId))
      .limit(1);

    return row?.subSchoolId === subSchoolId;
  }
}
