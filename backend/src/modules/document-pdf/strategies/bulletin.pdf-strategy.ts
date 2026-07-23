import {
    and,
    eq
} from 'drizzle-orm';
import { db } from '@/db';
import {
    grades,
    classes,
    academicPeriods
} from '@/db/schema';
import {
    DocumentPdfStrategy
} from "@/modules/document-pdf/document-pdf.schema";
import {
    BulletinDocument
} from "@school-hub/pdf-templates";


export const bulletinPdfStrategy: DocumentPdfStrategy<'bulletin'> = {
    async buildDocument({ classId, academicPeriodId }, locale, signature) {
        const [classRow] = await db.select().from(classes).where(eq(classes.id, classId));
        const [periodRow] = await db.select().from(academicPeriods).where(eq(academicPeriods.id, academicPeriodId));

        const classGrades = await db
            .select({
                courseId: grades.courseId,
                studentId: grades.studentId,
                score: grades.score,
                maxScore: grades.maxScore,
                coefficient: grades.coefficient,
            })
            .from(grades)
            .where(and(eq(grades.classId, classId), eq(grades.academicPeriodId, academicPeriodId)));

        // TODO: joindre courses pour le nom réel + regrouper par élève si le bulletin
        // est censé être un document par élève plutôt que par classe entière
        return BulletinDocument({
            locale,
            schoolName: 'SchoolHub',
            studentFullName: '—', // TODO: résoudre depuis students si scope par élève
            className: classRow?.name ?? '—',
            academicPeriodLabel: periodRow?.name ?? '—',
            rows: classGrades.map((g) => ({
                course: g.courseId,
                score: g.score ?? '-',
                maxScore: g.maxScore,
                coefficient: g.coefficient,
            })),
            signature,
        });
    },
};