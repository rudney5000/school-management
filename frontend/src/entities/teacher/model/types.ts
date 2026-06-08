export type Teacher = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    address?: string | null
    gender: 'male' | 'female'
    dateOfBirth: string
    hireDate: string
    qualification?: string | null
    specialization?: string | null
    isActive: boolean
}