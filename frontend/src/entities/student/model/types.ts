export type Student = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    gender: 'male' | 'female'
    image?: string | null
    dateOfBirth: string
    enrollmentDate: string
    subSchoolId: string
    parentId?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string
}
