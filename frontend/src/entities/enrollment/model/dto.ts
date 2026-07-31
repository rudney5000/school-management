export type CreateEnrollmentDto = {
    studentId: string
    classId: string
}

export type EnrollmentListQueryDto = {
    classId?: string
    studentId?: string
}

export type EnrollmentParamsDto = {
    id: string
}