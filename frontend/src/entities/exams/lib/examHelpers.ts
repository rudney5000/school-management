import type { ExamStatus, ExamType } from "../model/types"

export function getStatusBadgeClass(status: ExamStatus): string {
    return {
        scheduled: "bg-blue-50 text-blue-700",
        ongoing:   "bg-amber-50 text-amber-700",
        completed: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
    }[status]
}

export function getTypeBadgeClass(type: ExamType): string {
    return {
        quiz:     "bg-purple-50 text-purple-700",
        midterm:  "bg-blue-50 text-blue-700",
        final:    "bg-amber-50 text-amber-700",
        homework: "bg-green-50 text-green-700",
        oral:     "bg-pink-50 text-pink-700",
    }[type]
}