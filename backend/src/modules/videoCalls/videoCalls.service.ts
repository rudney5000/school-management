import {
    and,
    eq,
    isNull
} from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AccessToken } from 'livekit-server-sdk';
import { db } from '@/db';
import { AppError } from '@/shared/errors/app-error';
import type { CreateSessionDto } from './videoCalls.schema';
import {
    videoCallParticipants,
    videoCallSessions
} from "@/db/schema/videoCallSessions";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

export type VideoCallSessionRecord = typeof videoCallSessions.$inferSelect;

export type JoinSessionResult = {
    token: string;
    serverUrl: string;
    roomName: string;
    sessionId: string;
};

export class VideoCallsService {
    async findActiveByConversation(conversationId: string): Promise<VideoCallSessionRecord | null> {
        const [session] = await db
            .select()
            .from(videoCallSessions)
            .where(
                and(
                    eq(videoCallSessions.conversationId, conversationId),
                    eq(videoCallSessions.status, 'active'),
                ),
            );

        return session ?? null;
    }

    async findById(sessionId: string, subSchoolId: string): Promise<VideoCallSessionRecord> {
        const [session] = await db
            .select()
            .from(videoCallSessions)
            .where(
                and(
                    eq(videoCallSessions.id, sessionId),
                    eq(videoCallSessions.subSchoolId, subSchoolId)
                )
            );

        if (!session) throw new AppError('NOT_FOUND', 'Session d\'appel introuvable', 404);
        return session;
    }

    async create(
        input: CreateSessionDto,
        subSchoolId: string,
        initiatedBy: string,
    ): Promise<VideoCallSessionRecord> {
        if (input.conversationId) {
            const existing = await this.findActiveByConversation(input.conversationId);
            if (existing) return existing;
        }

        const roomName = `room_${randomUUID()}`;

        const [session] = await db
            .insert(videoCallSessions)
            .values({
                subSchoolId,
                conversationId: input.conversationId ?? null,
                roomName,
                initiatedBy,
                status: 'active',
            })
            .returning();

        return session;
    }

    async join(
        sessionId: string,
        subSchoolId: string,
        userId: string,
        userName: string
    ): Promise<JoinSessionResult> {
        const session = await this.findById(sessionId, subSchoolId);

        if (session.status !== 'active') {
            throw new AppError('CALL_ENDED', 'Cet appel est terminé', 400);
        }

        const [existingParticipant] = await db
            .select()
            .from(videoCallParticipants)
            .where(
                and(
                    eq(videoCallParticipants.sessionId, sessionId),
                    eq(videoCallParticipants.userId, userId),
                    isNull(videoCallParticipants.leftAt),
                ),
            );

        if (!existingParticipant) {
            await db.insert(videoCallParticipants).values({ sessionId, userId });
        }

        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: userId,
            name: userName,
        });

        token.addGrant({
            room: session.roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        return {
            token: await token.toJwt(),
            serverUrl: LIVEKIT_URL,
            roomName: session.roomName,
            sessionId: session.id,
        };
    }

    async leave(sessionId: string, userId: string): Promise<void> {
        await db
            .update(videoCallParticipants)
            .set({ leftAt: new Date() })
            .where(
                and(
                    eq(videoCallParticipants.sessionId, sessionId),
                    eq(videoCallParticipants.userId, userId),
                    isNull(videoCallParticipants.leftAt),
                ),
            );
    }

    async end(sessionId: string, subSchoolId: string, requesterId: string): Promise<void> {
        const session = await this.findById(sessionId, subSchoolId);

        if (session.initiatedBy !== requesterId) {
            throw new AppError('FORBIDDEN', 'Seul l\'initiateur peut terminer cet appel', 403);
        }

        await db.transaction(async (tx) => {
            await tx
                .update(videoCallSessions)
                .set({ status: 'ended', endedAt: new Date() })
                .where(eq(videoCallSessions.id, sessionId));

            await tx
                .update(videoCallParticipants)
                .set({ leftAt: new Date() })
                .where(
                    and(
                        eq(videoCallParticipants.sessionId, sessionId),
                        isNull(videoCallParticipants.leftAt),
                    ),
                );
        });
    }
}