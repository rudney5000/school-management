import {
    and,
    eq,
    SQL
} from "drizzle-orm";
import {db} from "@/db";
import {
    conversationMembers,
    conversations
} from "@/db/schema";
import {
    AppError
} from "@/shared/errors/app-error";

export class ChatProvisioningService {

    async onParentLinked(parentUserId: string, studentId: string, subSchoolId: string, classId: string) {
        await this.ensureAnnouncementChannel(subSchoolId, parentUserId)
        await this.ensureParentGroup(classId, subSchoolId, parentUserId)
    }

    private async ensureAnnouncementChannel(subSchoolId: string, userId: string) {
        let channel = await db.query.conversations.findFirst({
            where: and(eq(conversations.subSchoolId, subSchoolId), eq(conversations.type, 'announcement')),
        })

        if (!channel) {
            const inserted = await db.insert(conversations).values({
                type: 'announcement',
                subSchoolId,
                name: 'Annonces',
                createdBy: userId,
            })
                .onConflictDoNothing()
                .returning()

            channel = inserted[0] ?? await db.query.conversations.findFirst({
                where: and(eq(conversations.subSchoolId, subSchoolId), eq(conversations.type, 'announcement')),
            })
        }

        if (!channel) throw new AppError(
            'INTERNAL_ERROR',
            'Échec de création du canal annonces',
            500
        )

        await db.insert(conversationMembers)
            .values({ conversationId: channel.id, userId, role: 'member' })
            .onConflictDoNothing()
    }

    private async ensureParentGroup(classId: string, subSchoolId: string, userId: string) {
        let group = await db.query.conversations.findFirst({
            where: and(eq(conversations.classId, classId), eq(conversations.type, 'parent_group')),
        })
        if (!group) {
            [group] = await db.insert(conversations).values({
                type: 'parent_group', classId, subSchoolId, name: 'Parents', createdBy: userId,
            }).returning()
        }
        await db.insert(conversationMembers)
            .values({ conversationId: group.id, userId, role: 'member' })
            .onConflictDoNothing()
    }

    private async upsertConversation(
        whereClause: SQL | undefined,
        values: typeof conversations.$inferInsert,
    ) {
        let channel = await db.query.conversations.findFirst({ where: whereClause })
        if (channel) return channel

        const inserted = await db.insert(conversations)
            .values(values)
            .onConflictDoNothing()
            .returning()

        channel = inserted[0]
        if (!channel) {
            channel = await db.query.conversations.findFirst({ where: whereClause })
        }

        if (!channel) {
            throw new AppError('INTERNAL_ERROR', 'Échec de création du canal', 500)
        }

        return channel
    }

    private async addMemberSafely(conversationId: string, userId: string) {
        await db.insert(conversationMembers)
            .values({ conversationId, userId, role: 'member' })
            .onConflictDoNothing()
    }
}