import { pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', ['male', 'female']);

export const dayOfWeekEnum = pgEnum('day_of_week', [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
]);

export const attendanceStatusEnum = pgEnum('attendance_status', [
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
]);

export const payrollStatusEnum = pgEnum('payroll_status', [
    'PENDING',
    'PAID',
    'CANCELLED',
]);
export const paymentTypeEnum = pgEnum('payment_type', [
    'TUITION',
    'CANTEEN',
    'UNIFORM',
    'EXAM_FEE',
    'TRANSPORT',
    'ACTIVITY',
    'OTHER',
]);

export const roleEnum = pgEnum('role', [
    'super_admin',
    'admin',
    'director',
    'teacher',
    'worker',
    'parent',
    'student',
]);

export const EventTypeEnum = pgEnum('event_type', [
    'EXAM',
    'MEETING',
    'SPORT',
    'CULTURAL',
    'TRIP',
    'HOLIDAY',
    'COMPETITION',
    'OTHER',
]);

export const attendanceTargetEnum = pgEnum(
    'attendance_target',
    [
        'student',
        'teacher'
    ]
);

export const examTypeEnum = pgEnum(
    "exam_type",
    ["quiz", "midterm", "final", "homework", "oral"
    ])
export const examStatusEnum = pgEnum(
    "exam_status",
    ["scheduled", "ongoing", "completed", "cancelled"
    ])

export const gradeTypeEnum = pgEnum('grade_type', [
    'homework',
    'participation',
    'project',
    'oral',
])