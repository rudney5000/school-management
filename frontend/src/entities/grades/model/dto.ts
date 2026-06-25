import {GradeType} from "@entities/grades";

export type GradeParamsDto = {
    id: string
}

export type GradeListQueryDto = {
    studentId?:        string
    courseId?:         string
    classId?:          string
    academicPeriodId?: string
    subSchoolId?:      string
}

export type CreateGradeDto = {
    studentId:        string
    courseId:         string
    classId:          string
    academicPeriodId: string
    gradeType:        GradeType
    score:            number
    maxScore?:        number
    coefficient?:     number
    comment?:         string | null
}

export type UpdateGradeDto = {
    gradeType?:   GradeType
    score?:       number
    maxScore?:    number
    coefficient?: number
    comment?:     string | null
}

export type BulkCreateGradesDto = {
    courseId:         string
    classId:          string
    academicPeriodId: string
    gradeType:        GradeType
    maxScore?:        number
    coefficient?:     number
    results: {
        studentId: string
        score:     number | null
        comment?:  string | null
    }[]
}

export type BulletinQueryDto = {
    studentId:        string
    classId:          string
    academicPeriodId: string
    subSchoolId:      string
}
