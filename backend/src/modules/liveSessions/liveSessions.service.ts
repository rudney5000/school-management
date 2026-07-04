import {
    and,
    eq,
    isNull
} from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AccessToken } from 'livekit-server-sdk';
import { db } from '@/db';
import { AppError } from '@/shared/errors/app-error';
import type { CreateLiveSessionDto } from './liveSessions.schema';
import {
    liveSessions,
    liveSessionViewers
} from "@/db/schema/liveSessions";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

export type LiveSessionRecord = typeof liveSessions.$inferSelect;

export type LiveSessionAccess = {
    token: string;
    serverUrl: string;
    roomName: string;
    sessionId: string;
    canPublish: boolean;
};

export class LiveSessionsService {
    async findAll(subSchoolId: string): Promise<LiveSessionRecord[]> {
        return db
            .select()
            .from(liveSessions)
            .where(eq(liveSessions.subSchoolId, subSchoolId));
    }

    async findById(id: string, subSchoolId: string): Promise<LiveSessionRecord> {
        const [session] = await db
            .select()
            .from(liveSessions)
            .where(
                and(
                    eq(liveSessions.id, id),
                    eq(liveSessions.subSchoolId, subSchoolId),
                ),
            );

        if (!session) {
            throw new AppError('NOT_FOUND', 'Session live introuvable', 404);
        }

        return session;
    }

    async create(
        input: CreateLiveSessionDto,
        subSchoolId: string,
        teacherId: string,
    ): Promise<LiveSessionRecord> {
        const roomName = `live_${randomUUID()}`;

        const [session] = await db
            .insert(liveSessions)
            .values({
                subSchoolId,
                courseId: input.courseId ?? null,
                classId: input.classId ?? null,
                scheduleId: input.scheduleId ?? null,
                eventId: input.eventId ?? null,
                examId: input.examId ?? null,
                conversationId: input.conversationId ?? null,
                teacherId,
                roomName,
                status: 'scheduled',
                scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            })
            .returning();

        return session;
    }

    async start(id: string, subSchoolId: string, requesterId: string): Promise<LiveSessionRecord> {
        const session = await this.findById(id, subSchoolId);

        if (session.teacherId !== requesterId) {
            throw new AppError('FORBIDDEN', 'Seul l\'enseignant assigné peut démarrer ce live', 403);
        }

        if (session.status !== 'scheduled') {
            throw new AppError('INVALID_STATE', 'Ce live ne peut pas être démarré', 400);
        }

        const [updated] = await db
            .update(liveSessions)
            .set({ status: 'live', startedAt: new Date() })
            .where(eq(liveSessions.id, id))
            .returning();

        return updated;
    }

    async end(id: string, subSchoolId: string, requesterId: string): Promise<LiveSessionRecord> {
        const session = await this.findById(id, subSchoolId);

        if (session.teacherId !== requesterId) {
            throw new AppError('FORBIDDEN', 'Seul l\'enseignant assigné peut terminer ce live', 403);
        }

        const [updated] = await db
            .update(liveSessions)
            .set({ status: 'ended', endedAt: new Date() })
            .where(eq(liveSessions.id, id))
            .returning();

        await db
            .update(liveSessionViewers)
            .set({ leftAt: new Date() })
            .where(
                and(
                    eq(liveSessionViewers.sessionId, id),
                    isNull(liveSessionViewers.leftAt),
                ),
            );

        return updated;
    }

    async join(
        id: string,
        subSchoolId: string,
        userId: string,
        userName: string,
    ): Promise<LiveSessionAccess> {
        const session = await this.findById(id, subSchoolId);

        if (session.status !== 'live') {
            throw new AppError('NOT_LIVE', 'Ce live n\'est pas actif', 400);
        }

        const isTeacher = session.teacherId === userId;

        if (!isTeacher) {
            const [existing] = await db
                .select()
                .from(liveSessionViewers)
                .where(
                    and(
                        eq(liveSessionViewers.sessionId, id),
                        eq(liveSessionViewers.userId, userId),
                        isNull(liveSessionViewers.leftAt),
                    ),
                );

            if (!existing) {
                await db.insert(liveSessionViewers).values({ sessionId: id, userId });
            }
        }

        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: userId,
            name: userName,
        });

        token.addGrant({
            room: session.roomName,
            roomJoin: true,
            canPublish: isTeacher,
            canSubscribe: true,
        });

        return {
            token: await token.toJwt(),
            serverUrl: LIVEKIT_URL,
            roomName: session.roomName,
            sessionId: session.id,
            canPublish: isTeacher,
        };
    }

    async leave(id: string, userId: string): Promise<void> {
        await db
            .update(liveSessionViewers)
            .set({ leftAt: new Date() })
            .where(
                and(
                    eq(liveSessionViewers.sessionId, id),
                    eq(liveSessionViewers.userId, userId),
                    isNull(liveSessionViewers.leftAt),
                ),
            );
    }
}