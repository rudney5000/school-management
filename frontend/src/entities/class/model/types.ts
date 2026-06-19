export type Class = {
    id: string
    name: string
    gradeLevel?: string | undefined
    capacity: number
    subSchoolId: string
    studentsCount?: number
    teacher?: string[]
    isActive?: boolean
}