import {
    useState,
    useEffect
} from "react"
import {
    Save,
    Check,
    X,
    AlertCircle,
    RefreshCw
} from "lucide-react"
import {useParams} from "@tanstack/react-router";
import { useTranslation } from "@shared/lib"
import {
    Button,
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Textarea,
    Spinner
} from "@/shared/ui"
import {
    type ExamResult,
    useExam,
    useBulkUpsertExamResults,
    useExamResults
} from "@entities/exams"
import { useStudents } from "@entities/student"
import {useCourses} from "@entities/courses";
import {useClasses} from "@entities/class";

interface GradeEntryGridProps {
    examId: string
    onClose?: () => void
}

interface StudentResultRow {
    studentId: string
    studentName: string
    result?: ExamResult
    score: string
    comment: string
    isDirty: boolean
}

export function GradeEntryGrid({
                                   examId,
                                   onClose
}: GradeEntryGridProps) {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })

    const { data: exam, isLoading: examLoading } = useExam(examId, subSchoolId)
    const { data: existingResults, isLoading: resultsLoading } = useExamResults(examId, subSchoolId)
    const { data: students, isLoading: studentsLoading } = useStudents(subSchoolId)
    const { data: courses } = useCourses(subSchoolId)
    const { data: classes } = useClasses(subSchoolId)
    const bulkUpsert = useBulkUpsertExamResults()

    const [rows, setRows] = useState<StudentResultRow[]>([])
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        if (!students || students.length === 0) return

        const resultsMap = new Map((existingResults ?? []).map(r => [r.studentId, r]))

        setRows(students.map(student => {
            const existing = resultsMap.get(student.id)
            return {
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                result: existing,
                score: existing?.score ?? "",
                comment: existing?.comment ?? "",
                isDirty: false,
            }
        }))
        setHasUnsavedChanges(false)
    }, [students, existingResults])

    const handleScoreChange = (studentId: string, value: string) => {
        setRows(prev => prev.map(r =>
            r.studentId === studentId ? { ...r, score: value, isDirty: true } : r
        ))
        setHasUnsavedChanges(true)
    }

    const handleCommentChange = (studentId: string, value: string) => {
        setRows(prev => prev.map(r =>
            r.studentId === studentId ? { ...r, comment: value, isDirty: true } : r
        ))
        setHasUnsavedChanges(true)
    }

    const handleSave = () => {
        const results = rows
            .filter(r => r.isDirty)
            .map(r => ({
                studentId: r.studentId,
                score: r.score === "" ? null : parseFloat(r.score),
                comment: r.comment || null,
            }))

        if (results.length === 0) return

        bulkUpsert.mutate(
            { examId, results },
            {
                onSuccess: () => {
                    setHasUnsavedChanges(false)
                    setRows(prev => prev.map(r => ({ ...r, isDirty: false })))
                },
            }
        )
    }

    const getScoreColor = (score: string, maxScore: string) => {
        if (!score) return "text-muted-foreground"
        const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100
        if (percentage >= 80) return "text-green-600"
        if (percentage >= 60) return "text-blue-600"
        if (percentage >= 40) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBadge = (score: string, maxScore: string) => {
        if (!score) return null
        const percentage = (parseFloat(score) / parseFloat(maxScore)) * 100
        return percentage >= 50
            ? <Badge variant="default" className="bg-green-500 shrink-0">
                <Check className="w-3 h-3 mr-1" />
                {t("dashboard.exams.gradeEntry.pass")}
              </Badge>
            : <Badge variant="destructive" className="shrink-0">
                <X className="w-3 h-3 mr-1" />
                {t("dashboard.exams.gradeEntry.fail")}
              </Badge>
    }

    if (examLoading || studentsLoading || resultsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground text-center">
                    <Spinner/>
                    <p className="mt-2 text-sm">
                        {t("dashboard.exams.gradeEntry.loading")}
                    </p>
                </div>
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="flex items-center justify-center h-64 px-4 text-center">
                <div className="text-muted-foreground text-sm">
                    {t("dashboard.exams.gradeEntry.examNotFound")}
                </div>
            </div>
        )
    }

    const courseName = courses?.find(c => c.id === exam.courseId)?.name
    const className = classes?.find(c => c.id === exam.classId)?.name
    const isRetake = !!exam.retakeOfExamId

    const gradedCount = rows.filter(r => r.score !== "").length

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="text-lg sm:text-2xl break-words">{exam.title}</CardTitle>
                                {isRetake && (
                                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600 shrink-0">
                                        <RefreshCw className="w-3 h-3" />
                                        {t("dashboard.exams.gradeEntry.retake")}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="mt-2">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                                    {courseName && <Badge variant="outline">{courseName}</Badge>}
                                    {className && <span>{className}</span>}
                                    <span>{t("dashboard.exams.gradeEntry.maxScore")}: {exam.maxScore}</span>
                                    <span>Coeff: {exam.coefficient}</span>
                                </div>
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                            {hasUnsavedChanges && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">{t("dashboard.exams.gradeEntry.unsavedChanges")}</span>
                                    <span className="sm:hidden">{t("common.unsaved")}</span>
                                </Badge>
                            )}
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleSave}
                                    disabled={!hasUnsavedChanges || bulkUpsert.isPending}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {t("dashboard.exams.gradeEntry.save")}
                                </Button>
                                {onClose && (
                                    <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                                        {t("dashboard.exams.gradeEntry.close")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="p-3 sm:p-6">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
                        <div className="col-span-4">{t("dashboard.exams.gradeEntry.student")}</div>
                        <div className="col-span-2">{t("dashboard.exams.gradeEntry.score")} / {exam.maxScore}</div>
                        <div className="col-span-2">{t("dashboard.exams.gradeEntry.percentage")}</div>
                        <div className="col-span-2">{t("dashboard.exams.gradeEntry.status")}</div>
                        <div className="col-span-2">{t("dashboard.exams.gradeEntry.comment")}</div>
                    </div>

                    <div className="space-y-3 md:space-y-4 md:mt-4">
                        {rows.map((row) => (
                            <div
                                key={row.studentId}
                                className={`rounded-lg border p-3 transition-colors md:grid md:grid-cols-12 md:gap-4 md:px-4 md:py-3 ${
                                    row.isDirty ? "bg-amber-50 border-amber-200" : "bg-card"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 md:col-span-4 md:items-center">
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm truncate">{row.studentName}</div>
                                        {row.result?.gradedAt && (
                                            <div className="text-xs text-muted-foreground">
                                                {t("dashboard.exams.gradeEntry.gradedOn")} {new Date(row.result.gradedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:hidden">
                                        {getScoreBadge(row.score, exam.maxScore)}
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-3 md:mt-0 md:contents">
                                    <div className="flex-1 md:col-span-2">
                                        <label className="mb-1 block text-xs text-muted-foreground md:hidden">
                                            {t("dashboard.exams.gradeEntry.score")} / {exam.maxScore}
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max={exam.maxScore}
                                            value={row.score}
                                            onChange={(e) => handleScoreChange(row.studentId, e.target.value)}
                                            className={`text-sm w-full md:w-24 ${getScoreColor(row.score, exam.maxScore)}`}
                                            placeholder="—"
                                        />
                                    </div>

                                    <div className="flex items-center text-sm md:col-span-2">
                                        {row.score ? (
                                            <span className={getScoreColor(row.score, exam.maxScore)}>
                                                {((parseFloat(row.score) / parseFloat(exam.maxScore)) * 100).toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>

                                    <div className="hidden md:col-span-2 md:flex md:items-center">
                                        {getScoreBadge(row.score, exam.maxScore)}
                                    </div>
                                </div>

                                <div className="mt-3 md:col-span-2 md:mt-0">
                                    <label className="mb-1 block text-xs text-muted-foreground md:hidden">
                                        {t("dashboard.exams.gradeEntry.comment")}
                                    </label>
                                    <Textarea
                                        value={row.comment}
                                        onChange={(e) => handleCommentChange(row.studentId, e.target.value)}
                                        placeholder={t("dashboard.exams.gradeEntry.addComment")}
                                        className="text-sm min-h-[60px] resize-none"
                                        rows={1}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-muted-foreground">
                                {gradedCount} / {rows.length} {t("dashboard.exams.gradeEntry.studentsGraded")}
                            </div>
                            {gradedCount > 0 && (
                                <div className="font-medium">
                                    {t("dashboard.exams.gradeEntry.average")}: {
                                    (rows
                                            .filter(r => r.score !== "")
                                            .reduce((sum, r) => sum + parseFloat(r.score), 0) / gradedCount
                                    ).toFixed(2)
                                } / {exam.maxScore}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
