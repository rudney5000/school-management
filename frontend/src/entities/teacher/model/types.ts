export type Teacher = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string | null
    gender: 'male' | 'female'
    image?: string
    dateOfBirth: string
    hireDate: string
    qualification?: string | null
    specialization?: string | null
    isActive: boolean
}