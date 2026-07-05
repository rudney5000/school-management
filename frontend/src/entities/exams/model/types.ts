
export enum ExamType {
    Quiz     = "quiz",
    Midterm  = "midterm",
    Final    = "final",
    Homework = "homework",
    Oral     = "oral",
}

export enum ExamStatus {
    Scheduled = "scheduled",
    Ongoing   = "ongoing",
    Completed = "completed",
    Cancelled = "cancelled",
}

export interface Exam {
    id: string
    title: string
    type: ExamType
    status: ExamStatus
    examDate: string
    durationMinutes: number
    maxScore: string
    coefficient: string
    courseId: string
    classId: string
    subSchoolId: string
    academicPeriodId: string
    createdBy: string
    createdAt: string
    updatedAt: string
    courseName: string
    className: string
    isLiveSession: boolean
    liveUrl?: string
}