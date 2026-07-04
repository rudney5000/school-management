export type CreateLiveSessionDto = {
    courseId?: string;
    classId?: string;
    scheduleId?: string;
    eventId?: string;
    examId?: string;
    conversationId?: string;
    scheduledAt?: string;
};

export type LiveSessionParamsDto = {
    sessionId: string;
};

export type SubSchoolQueryDto = {
    subSchoolId: string;
};