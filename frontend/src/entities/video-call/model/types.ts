export type VideoCallSession = {
    id: string;
    subSchoolId: string;
    conversationId: string | null;
    roomName: string;
    initiatedBy: string;
    status: 'active' | 'ended';
    startedAt: string;
    endedAt: string | null;
};

export type JoinVideoCallResult = {
    token: string;
    serverUrl: string;
    roomName: string;
    sessionId: string;
};