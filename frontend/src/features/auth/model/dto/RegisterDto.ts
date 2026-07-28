import type {LoginDto} from "@features/auth/model/dto/LoginDto";

export type UserRole = 'admin' | 'super_admin' | 'director' | 'teacher' | 'worker' | 'parent' | 'student'

export interface RegisterDto extends LoginDto {
    role: UserRole
    workerId?: string
    parentId?: string
    studentId?: string
    teacherId?: string
}