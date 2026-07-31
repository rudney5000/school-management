export enum ExamType {
    Quiz     = "quiz",
    Midterm  = "midterm",
    Final    = "final",
    Homework = "homework",
    Oral     = "oral",
    Exam      = "exam",
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
    retakeOfExamId: string | null
}

export interface ExamResult {
    id:        string
    examId:    string
    studentId: string
    score:     string | null
    comment:   string | null
    gradedBy:  string | null
    gradedAt:  string | null
    createdAt: string
    updatedAt: string
}