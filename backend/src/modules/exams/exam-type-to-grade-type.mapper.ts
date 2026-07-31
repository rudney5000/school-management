import {AppError} from "@/shared/errors/app-error";
import {gradeTypeSchema} from "@/modules/grades/grades.schema";
import {z} from "zod";

type GradeType = z.infer<typeof gradeTypeSchema>
export const EXAM_TYPE_TO_GRADE_TYPE: Record<string, GradeType> = {
    quiz:     'exam',
    midterm:  'exam',
    final:    'exam',
    homework: 'homework',
    oral:     'oral',
    exam:     'exam',
}

export function mapExamTypeToGradeType(examType: string): GradeType {
    const mapped = EXAM_TYPE_TO_GRADE_TYPE[examType]
    if (!mapped) {
        throw new AppError(
            'VALIDATION_ERROR',
            `Aucun mapping gradeType trouvé pour le type d'examen "${examType}"`,
            422,
        )
    }
    return mapped
}