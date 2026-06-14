export type Schedule = {
    id: string
    classId: string
    courseId: string
    teacherId: string
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
    startTime: string
    endTime: string
    room: string | null
    subSchoolId: string
    academicYear: string
    createdAt: string
}

export type ScheduleWithRelations = Schedule & {
    class: {
        id: string
        name: string
    }
    course: {
        id: string
        name: string
    }
    teacher: {
        id: string
        firstName: string
        lastName: string
    }
}