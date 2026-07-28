import {
    eq,
    and
} from 'drizzle-orm'
import { db } from '@/db'
import {
    teachers,
    teacherSchools,
    subSchools
} from '@/db/schema'
import { AppError } from '@/shared/errors/app-error'
import {
    TeacherContractDocument
} from '@school-hub/pdf-templates'
import type {
    DocumentPdfStrategy
} from '@/modules/document-pdf/document-pdf.schema'

function computeAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const hasHadBirthday =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
    if (!hasHadBirthday) age -= 1
    return age
}

export const teacherContractPdfStrategy: DocumentPdfStrategy<'teacher_contract'> = {
    async buildDocument({ teacherId, subSchoolId }, locale, signature) {
        const [teacher] = await db.select().from(teachers).where(eq(teachers.id, teacherId))
        if (!teacher) throw new AppError('NOT_FOUND', 'Enseignant introuvable', 404)

        const [assignment] = await db
            .select()
            .from(teacherSchools)
            .where(and(eq(teacherSchools.teacherId, teacherId), eq(teacherSchools.subSchoolId, subSchoolId)))
        if (!assignment) throw new AppError('NOT_FOUND', 'Affectation introuvable', 404)

        const [subSchool] = await db.select().from(subSchools).where(eq(subSchools.id, subSchoolId))

        return TeacherContractDocument({
            locale,
            schoolName: subSchool?.name ?? 'École',
            teacherFullName: `${teacher.firstName} ${teacher.lastName}`,
            teacherImageUrl: teacher.image ?? null,
            gender: teacher.gender,
            age: computeAge(teacher.dateOfBirth),
            dateOfBirth: teacher.dateOfBirth,
            maritalStatus: teacher.maritalStatus ?? null,
            hasChildren: teacher.hasChildren ?? false,
            childrenCount: teacher.childrenCount ?? 0,
            yearsOfExperience: teacher.yearsOfExperience ?? 0,
            hireDate: assignment.hireDate,
            contractEndDate: assignment.contractEndDate ?? null,
            contractType: assignment.contractType ?? 'permanent',
            salary: assignment.salary ? Number(assignment.salary) : null,
            weeklyHours: assignment.weeklyHours ?? null,
            subjectsTaught: assignment.subjectsTaught ?? null,
            contractClauses: assignment.contractClauses ?? null,
            qualification: assignment.qualification ?? null,
            specialization: assignment.specialization ?? null,
            signature,
        })
    },
}