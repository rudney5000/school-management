import {useMemo} from "react";
import {BookOpen} from "lucide-react";
import type {Student} from "@entities/student";
import {
    cn,
    getInitials,
    useTranslation
} from "@shared/lib";
import {useExamResultsByStudent} from "@entities/exams";
import {
    Spinner,
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/shared/ui"

interface ChildResultsProps {
    student: Student;
    subSchoolId: string
}

export function ChildResults({ student, subSchoolId }: ChildResultsProps) {
    const { t } = useTranslation()
    const { data: results, isLoading } = useExamResultsByStudent(student.id, subSchoolId)
    const fullName = `${student.firstName} ${student.lastName}`
    const image = student.image ?? `https://i.pravatar.cc/150?u=${student.id}`

    const average = useMemo(() => {
        if (!results || results.length === 0) return 0
        const graded = results.filter(r => r.score !== null)
        if (graded.length === 0) return 0
        const sum = graded.reduce((acc, r) => acc + Number(r.score) / Number(r.maxScore), 0)
        return sum / graded.length
    }, [results])

    return (
        <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={image} alt={fullName}/>
                        <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-xs font-semibold">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                            {fullName}
                        </h3>
                        <p className="text-xs text-zinc-500">
                            {t('dashboard.exams.reportCard.resultCount', { count: results?.length ?? 0 })}
                        </p>
                    </div>
                </div>
                {results && results.length > 0 && (
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-0.5">
                            {t('dashboard.exams.reportCard.average')}
                        </p>
                        <p className={cn(
                            "text-base font-medium",
                            average >= 0.5 ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {Math.round(average * 100)}%
                        </p>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="py-6 text-center text-sm text-zinc-400">
                    <Spinner/>
                    {t('dashboard.exams.reportCard.loading')}
                </div>
            ) : !results || results.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-400">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-30"/>
                    {t('dashboard.exams.reportCard.empty')}
                </div>
            ) : (
                <div className="flex flex-col">
                    {results.map((r) => (
                        <div key={r.id} className="flex items-center justify-between py-2.5 border-t border-zinc-100">
                            <div className="min-w-0">
                                <p className="text-[13px] font-medium text-zinc-900 truncate">{r.examTitle}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {new Date(r.examDate).toLocaleDateString('fr-FR')} · {t(`dashboard.exams.types.${r.examType}`)}
                                </p>
                            </div>
                            {r.score !== null ? (
                                <span className={cn(
                                    "shrink-0 text-[13px] font-medium px-2.5 py-1 rounded-full",
                                    Number(r.score) / Number(r.maxScore) >= 0.5
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                )}>
                                    {r.score} / {r.maxScore}
                                </span>
                            ) : (
                                <span className="shrink-0 text-[13px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500">
                                    {t('dashboard.exams.reportCard.pending')}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}