export type Parent = {
    id: string
    userId?: string | null
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string | null
    gender: 'male' | 'female'
    image?: string
    isActive: boolean
    dateOfBirth: string
    subSchoolId: string
    createdAt: string
    children: { id: string; firstName: string; lastName: string }[]
}