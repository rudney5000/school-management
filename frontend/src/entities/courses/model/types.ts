import type {Teacher} from "@entities/teacher";
import type {
    CourseColor,
    CourseIcon,
    CourseStatus
} from "@entities/courses/model/constants";

export type Course = {
    id: string
    name: string
    code: string
    description: string
    credits: number
    icon:  CourseIcon
    color: CourseColor
    teacherId?: string
    teacher?: CourseTeacher
    totalLessons: number
    totalHours: number
    status: CourseStatus
    subSchoolId: string
    isDistanceCourse: boolean
    liveScheduledAt?: string
    liveUrl?: string
    createdAt: string
}

export type CourseTeacher = Pick<Teacher, 'id' | 'firstName' | 'lastName' | 'image'>


