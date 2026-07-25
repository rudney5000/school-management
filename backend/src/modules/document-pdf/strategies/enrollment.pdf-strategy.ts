import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
    enrollments,
    students,
    classes
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import {
    EnrollmentDocument
} from '@school-hub/pdf-templates';
import {
    DocumentPdfStrategy
} from "@/modules/document-pdf/document-pdf.schema";

export const enrollmentPdfStrategy: DocumentPdfStrategy<'enrollment'> = {
    async buildDocument({ enrollmentId }, locale, signature) {
        const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
        if (!enrollment) {
            throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
        }

        const [student] = await db.select().from(students).where(eq(students.id, enrollment.studentId));
        const [classRow] = await db.select().from(classes).where(eq(classes.id, enrollment.classId));

        return EnrollmentDocument({
            locale,
            schoolName: 'EduPulse',
            studentFullName: `${student.firstName} ${student.lastName}`,
            className: classRow?.name ?? '—',
            enrollmentDate: student.enrollmentDate,
            dateOfBirth: student.dateOfBirth,
            signature,
        });
    },
};