export type LiveSessionStatus = 'scheduled' | 'live' | 'ended';

export type LiveSession = {
    id: string;
    subSchoolId: string;
    courseId: string | null;
    classId: string | null;
    scheduleId: string | null;
    eventId: string | null;
    examId: string | null;
    conversationId: string | null;
    teacherId: string;
    roomName: string;
    status: LiveSessionStatus;
    scheduledAt: string | null;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
};

export type LiveSessionAccess = {
    token: string;
    serverUrl: string;
    roomName: string;
    sessionId: string;
    canPublish: boolean;
};