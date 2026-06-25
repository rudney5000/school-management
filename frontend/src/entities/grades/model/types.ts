export interface GradeStatistics {
    examId: string
    average: number
    median: number
    min: number
    max: number
    passRate: number
    distribution: {
        range: string
        count: number
        percentage: number
    }[]
}

export interface StudentBulletin {
    studentId: string
    studentName: string
    studentFirstName: string
    studentLastName: string
    grades: Grade[]
    average: number
    weightedAverage: number
    totalCoefficient: number
    rank?: number
    classAverage: number
}

export enum GradeType {
    Homework      = 'homework',
    Participation = 'participation',
    Project       = 'project',
    Oral          = 'oral',
}

export interface Grade {
    id:               string
    studentId:        string
    courseId:         string
    classId:          string
    subSchoolId:      string
    academicPeriodId: string
    gradeType:        GradeType
    score:            string
    maxScore:         string
    coefficient:      string
    comment:          string | null
    gradedBy:         string | null
    gradedAt:         string | null
    createdAt:        string
    updatedAt:        string
}