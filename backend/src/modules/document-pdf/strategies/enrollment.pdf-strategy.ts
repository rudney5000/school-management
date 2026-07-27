import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
    enrollments,
    students,
    classes,
    subSchools
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import {
    EnrollmentDocument
} from '@school-hub/pdf-templates';
import {
    DocumentPdfStrategy
} from "@/modules/document-pdf/document-pdf.schema";

function computeAge(dateOfBirth: string | Date): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasHadBirthdayThisYear) age -= 1;
    return age;
}
export const enrollmentPdfStrategy: DocumentPdfStrategy<'enrollment'> = {
    async buildDocument({ enrollmentId }, locale, signature) {
        const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
        if (!enrollment) {
            throw new AppError('NOT_FOUND', 'Inscription introuvable', 404);
        }

        const [student] = await db.select().from(students).where(eq(students.id, enrollment.studentId));
        if (!student) {
            throw new AppError('NOT_FOUND', 'Élève introuvable', 404);
        }

        const [classRow] = await db.select().from(classes).where(eq(classes.id, enrollment.classId));
        const [subSchool] = await db.select().from(subSchools).where(eq(subSchools.id, student.subSchoolId));

        return EnrollmentDocument({
            locale,
            schoolName: subSchool?.name ?? 'École',
            studentFullName: `${student.firstName} ${student.lastName}`,
            gender: student.gender,
            age: computeAge(student.dateOfBirth),
            className: classRow?.name ?? '—',
            enrollmentDate: enrollment.enrollmentDate.toISOString(),
            dateOfBirth: student.dateOfBirth,
            signature,
        });
    },
};