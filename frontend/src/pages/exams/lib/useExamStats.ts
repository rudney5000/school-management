import type {Exam} from "@entities/exams";

export function useExamStats(exams: Exam[]) {
    const total = exams.length
    const completed = exams.filter((e) => e.status === 'completed').length
    const scheduled = exams.filter((e) => e.status === 'scheduled').length

    const avg = '—'

    return { total, completed, scheduled, avg }
}

