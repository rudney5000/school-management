import {db} from "@/db";
import {academicPeriods} from "@/db/schema/academicPeriod";
import {and, eq} from "drizzle-orm";
import {AppError} from "@/shared/errors/app-error";
import {
    CreateAcademicPeriodInput,
    UpdateAcademicPeriodInput
} from "@/modules/academic-periods/academic-periods.schema";

export type AcademicPeriodRecord = typeof academicPeriods.$inferSelect

export class AcademicPeriodsService {

    async findAll(subSchoolId: string): Promise<AcademicPeriodRecord[]> {
        return db
            .select()
            .from(academicPeriods)
            .where(eq(academicPeriods.subSchoolId, subSchoolId))
    }

    async findById(id: string, subSchoolId: string): Promise<AcademicPeriodRecord> {
        const [period] = await db
            .select()
            .from(academicPeriods)
            .where(
                and(
                    eq(academicPeriods.id, id),
                    eq(academicPeriods.subSchoolId, subSchoolId),
                )
            )

        if (!period) {
            throw new AppError('NOT_FOUND', 'Période académique introuvable', 404)
        }

        return period
    }

    async create(input: CreateAcademicPeriodInput & { subSchoolId: string }): Promise<AcademicPeriodRecord> {
        if (input.isCurrent) {
            await this.clearCurrent(input.subSchoolId)
        }

        const [period] = await db
            .insert(academicPeriods)
            .values({
                subSchoolId: input.subSchoolId,
                name: input.name,
                type: input.type,
                startDate: input.startDate,
                endDate: input.endDate,
                isCurrent: input.isCurrent ?? false,
            })
            .returning()

        return period
    }

    async update(
        id: string,
        subSchoolId: string,
        input: UpdateAcademicPeriodInput,
    ): Promise<AcademicPeriodRecord> {
        await this.findById(id, subSchoolId)

        if (input.isCurrent) {
            await this.clearCurrent(subSchoolId, id)
        }

        const [period] = await db
            .update(academicPeriods)
            .set({
                ...input,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(academicPeriods.id, id),
                    eq(academicPeriods.subSchoolId, subSchoolId),
                )
            )
            .returning()

        return period
    }

    async delete(id: string, subSchoolId: string): Promise<void> {
        await this.findById(id, subSchoolId)

        await db
            .delete(academicPeriods)
            .where(
                and(
                    eq(academicPeriods.id, id),
                    eq(academicPeriods.subSchoolId, subSchoolId),
                )
            )
    }

    private async clearCurrent(subSchoolId: string, exceptId?: string): Promise<void> {
        await db
            .update(academicPeriods)
            .set({isCurrent: false, updatedAt: new Date()})
            .where(
                and(
                    eq(academicPeriods.subSchoolId, subSchoolId),
                    eq(academicPeriods.isCurrent, true),
                    exceptId ? and() : undefined,
                )
            )
    }
}