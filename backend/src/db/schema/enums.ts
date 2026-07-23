import { pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', [
    'male',
    'female'
]);

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

export const attendanceTargetEnum = pgEnum('attendance_target', [
        'student',
        'teacher'
    ]);

export const examTypeEnum = pgEnum("exam_type", [
    "quiz",
    "midterm",
    "final",
    "homework",
    "oral"
    ])

export const examStatusEnum = pgEnum("exam_status", [
    "scheduled",
    "ongoing",
    "completed",
    "cancelled"
    ])

export const gradeTypeEnum = pgEnum('grade_type', [
    'homework',
    'participation',
    'project',
    'oral',
    'exam'
])

export const conversationTypeEnum = pgEnum('conversation_type', [
    'dm',
    'group',
    'class',
    'course',
])

export const memberRoleEnum = pgEnum('member_role', [
    'admin',
    'member',
])

export const messageTypeEnum = pgEnum('message_type', [
    'text',
    'image',
    'file',
    'system',
])

export const videoCallStatusEnum = pgEnum('video_call_status', [
    'active',
    'ended'
]);

export const liveSessionStatusEnum = pgEnum('live_session_status', [
    'scheduled',
    'live',
    'ended'
]);

export const disputeStatusEnum = pgEnum('dispute_status', [
    'pending',
    'approved',
    'rejected'
])

export const signatureStatusEnum = pgEnum('signature_status', [
    'active',
    'revoked'
]);

export const certificateTypeEnum = pgEnum('certificate_type', [
    'enrollment',
    'completion',
    'transfer',
    'conduct',
    'graduation',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
    'draft',
    'complete'
]);

export const attachableTypeEnum = pgEnum('attachable_type', [
    'conversation',
    'enrollment',
    'payment',
])

export const attachmentCategoryEnum = pgEnum("attachment_category", [
    "birth_certificate",
    "medical_certificate",
    "previous_report",
    "parent_id",
    "student_photo",
    "payment_receipt",
    "other",
]);