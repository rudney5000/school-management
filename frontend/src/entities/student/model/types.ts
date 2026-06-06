export type Student = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    gender: 'male' | 'female'
    dateOfBirth: string
    enrollmentDate: string
    schoolId: string
    parentId?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string
}
