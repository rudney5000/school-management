export enum AcademicPeriodType {
    Trimester = 'trimester',
    Semester  = 'semester',
    Annual    = 'annual',
}

export interface AcademicPeriod {
    id:          string
    subSchoolId: string
    name:        string
    type:        AcademicPeriodType
    startDate:   string
    endDate:     string
    isCurrent:   boolean
    createdAt:   string
    updatedAt:   string
}