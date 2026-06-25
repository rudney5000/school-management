export type ExamParamsDto = {
    id: string
}

export type ExamListQueryDto = {
    subSchoolId: string
}

export type ExamResultParamsDto = {
    id: string
}

export type ExamResultListQueryDto = {
    examId?: string
    studentId?: string
    subSchoolId?: string
}

export type CreateExamResultDto = {
    examId:    string
    studentId: string
    score:     number | null
    comment?:  string | null
}

export type BulkCreateExamResultsDto = {
    examId: string
    results: {
        studentId: string
        score:     number | null
        comment?:  string | null
    }[]
}