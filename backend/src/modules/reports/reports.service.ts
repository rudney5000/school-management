import {
    and,
    desc,
    eq,
    gte,
    lte
} from 'drizzle-orm';
import { db } from '@/db';
import {
    reports,
    reportStatusHistory
} from '@/db/schema/reports';
import {
    AppError
} from '@/shared/errors/app-error';
import {
    AssignReportDto,
    CreateReportDto,
    ReportFiltersDto,
    UpdateReportStatusDto
} from "@/modules/reports/reports.schema";
import {
    emitToReportRoom,
    emitToUserRoom
} from "@/socket/middleware/reports.socket";
import {
    parentStudents,
    users
} from "@/db/schema";

export type ReportRecord = typeof reports.$inferSelect;

interface ReportActorContext {
    userId: string;
    role: string;
    schoolId: string;
    subSchoolId: string;
}

export class ReportsService {

    async create(input: CreateReportDto, ctx: ReportActorContext): Promise<ReportRecord> {
        if (input.relatedStudentId && ctx.role === 'parent') {
            const isOwnChild = await this.isParentOfStudent(ctx.userId, input.relatedStudentId);
            if (!isOwnChild) {
                throw new AppError(
                    'FORBIDDEN',
                    "Élève non lié à ce compte parent",
                    403
                );
            }
        }

        const [report] = await db
            .insert(reports)
            .values({
                schoolId: ctx.schoolId,
                subSchoolId: ctx.subSchoolId,
                reporterId: input.isAnonymous ? null : ctx.userId,
                reporterRole: ctx.role as ReportRecord['reporterRole'],
                isAnonymous: input.isAnonymous,
                category: input.category,
                otherCategoryLabel: input.otherCategoryLabel,
                description: input.description,
                involvedPersonName: input.involvedPersonName,
                involvedPersonRole: input.involvedPersonRole,
                relatedStudentId: input.relatedStudentId,
            })
            .returning();

        emitToReportRoom(ctx.subSchoolId, 'report:new', {
            id: report.id,
            category: report.category,
            status: report.status,
            isAnonymous: report.isAnonymous,
            createdAt: report.createdAt,
        });

        return report;
    }

    async findAll(filters: ReportFiltersDto, subSchoolId: string): Promise<ReportRecord[]> {
        const conditions = [eq(reports.subSchoolId, subSchoolId)];

        if (filters.status) conditions.push(eq(reports.status, filters.status));
        if (filters.category) conditions.push(eq(reports.category, filters.category));
        if (filters.from) conditions.push(gte(reports.createdAt, new Date(filters.from)));
        if (filters.to) conditions.push(lte(reports.createdAt, new Date(filters.to)));

        return db
            .select()
            .from(reports)
            .where(and(...conditions))
            .orderBy(desc(reports.createdAt));
    }

    async findById(id: string, subSchoolId: string): Promise<ReportRecord> {
        const [report] = await db
            .select()
            .from(reports)
            .where(
                and(
                    eq(reports.id, id),
                    eq(reports.subSchoolId, subSchoolId)
                )
            );

        if (!report) {
            throw new AppError(
                'NOT_FOUND',
                'Signalement introuvable',
                404
            );
        }

        return report;
    }

    async findByReporter(userId: string): Promise<ReportRecord[]> {
        return db
            .select()
            .from(reports)
            .where(eq(reports.reporterId, userId))
            .orderBy(desc(reports.createdAt));
    }

    async findByTrackingToken(token: string) {
        const [report] = await db
            .select()
            .from(reports)
            .where(eq(reports.trackingToken, token));

        if (!report) {
            throw new AppError(
                'NOT_FOUND',
                'Signalement introuvable',
                404
            );
        }

        return {
            status: report.status,
            createdAt: report.createdAt,
            resolutionNote: report.resolutionNote,
        };
    }

    async updateStatus(
        id: string,
        input: UpdateReportStatusDto,
        actorId: string,
        subSchoolId: string,
    ): Promise<ReportRecord> {
        const current = await this.findById(id, subSchoolId);

        const [updated] = await db
            .update(reports)
            .set({
                status: input.status,
                resolutionNote: input.note ?? current.resolutionNote,
                updatedAt: new Date(),
                ...(input.status === 'resolved'
                    ? { resolvedAt: new Date(), resolvedById: actorId }
                    : {}),
            })
            .where(eq(reports.id, id))
            .returning();

        await db.insert(reportStatusHistory).values({
            reportId: id,
            fromStatus: current.status,
            toStatus: input.status,
            changedById: actorId,
            note: input.note,
        });

        emitToReportRoom(updated.subSchoolId, 'report:statusUpdated', {
            id: updated.id,
            status: updated.status,
        });

        if (updated.reporterId) {
            emitToUserRoom(updated.reporterId, 'report:statusUpdated', {
                id: updated.id,
                status: updated.status,
            });
        }

        return updated;
    }

    async assign(
        id: string,
        input: AssignReportDto,
        subSchoolId: string,
    ): Promise<ReportRecord> {
        await this.findById(id, subSchoolId);

        const [updated] = await db
            .update(reports)
            .set({ assignedToId: input.assignedToId, updatedAt: new Date() })
            .where(eq(reports.id, id))
            .returning();

        emitToReportRoom(updated.subSchoolId, 'report:assigned', {
            id: updated.id,
            assignedToId: updated.assignedToId,
        });

        return updated;
    }

    private async isParentOfStudent(authUserId: string, studentId: string): Promise<boolean> {
        const [userRecord] = await db
            .select({ parentId: users.parentId })
            .from(users)
            .where(eq(users.id, authUserId))
            .limit(1);

        if (!userRecord?.parentId) {
            return false;
        }

        const [link] = await db
            .select()
            .from(parentStudents)
            .where(
                and(
                    eq(parentStudents.parentId, userRecord.parentId),
                    eq(parentStudents.studentId, studentId),
                ),
            )
            .limit(1);

        return !!link;
    }
}