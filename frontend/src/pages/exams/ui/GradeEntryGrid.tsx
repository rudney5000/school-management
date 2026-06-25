import { useState, useEffect } from "react"
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
    Textarea
} from "@/shared/ui"
import {
    Save,
    Check,
    X,
    AlertCircle
} from "lucide-react"
import {ExamType, useExam} from "@entities/exams"
import { useStudents } from "@entities/student"
import {
    useGrades,
    useBulkCreateGrades,
    useUpdateGrade,
    GradeType,
    type Grade
} from "@entities/grades"
import {useParams} from "@tanstack/react-router";

interface GradeEntryGridProps {
    examId: string
    onClose?: () => void
}

interface StudentGrade {
    studentId: string
    studentName: string
    studentFirstName: string
    studentLastName: string
    grade?: Grade
    score: string
    comment: string
    isDirty: boolean
}

export function GradeEntryGrid({ examId, onClose }: GradeEntryGridProps) {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const { data: exam, isLoading: examLoading } = useExam(examId)
    const { data: students = [], isLoading: studentsLoading } = useStudents(subSchoolId)
    const { data: existingGrades = [], isLoading: gradesLoading } = useGrades({ courseId: exam?.courseId, classId: exam?.classId, subSchoolId })
    
    const bulkCreateGrades = useBulkCreateGrades()
    const updateGrade = useUpdateGrade()

    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Initialize student grades when data loads
    useEffect(() => {
        if (students.length > 0 && existingGrades.length >= 0) {
            const gradesMap = new Map(existingGrades.map(g => [g.studentId, g]))
            
            const initialized = students.map(student => {
                const existingGrade = gradesMap.get(student.id)
                return {
                    studentId: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    studentFirstName: student.firstName,
                    studentLastName: student.lastName,
                    grade: existingGrade,
                    score: existingGrade?.score?.toString() || "",
                    comment: existingGrade?.comment || "",
                    isDirty: false
                }
            })
            setStudentGrades(initialized)
        }
    }, [students, existingGrades])

    const handleScoreChange = (studentId: string, value: string) => {
        setStudentGrades(prev => prev.map(sg => 
            sg.studentId === studentId 
                ? { ...sg, score: value, isDirty: true }
                : sg
        ))
        setHasUnsavedChanges(true)
    }

    const handleCommentChange = (studentId: string, value: string) => {
        setStudentGrades(prev => prev.map(sg => 
            sg.studentId === studentId 
                ? { ...sg, comment: value, isDirty: true }
                : sg
        ))
        setHasUnsavedChanges(true)
    }

    const handleSave = async () => {
        const toCreate = studentGrades
            .filter(sg => !sg.grade && sg.score !== "")
            .map(sg => ({
                studentId: sg.studentId,
                score: parseFloat(sg.score),
                comment: sg.comment
            }))

        const toUpdate = studentGrades
            .filter(sg => sg.grade && sg.isDirty)
            .map(sg => ({
                id: sg.grade!.id,
                dto: {
                    score: sg.score !== "" ? parseFloat(sg.score) : undefined,
                    comment: sg.comment
                }
            }))

        if (toCreate.length > 0 && exam) {
            const examTypeToGradeType: Record<ExamType, GradeType> = {
                [ExamType.Quiz]: GradeType.Homework,
                [ExamType.Midterm]: GradeType.Project,
                [ExamType.Final]: GradeType.Project,
                [ExamType.Homework]: GradeType.Homework,
                [ExamType.Oral]: GradeType.Oral,
            }
            
            await bulkCreateGrades.mutateAsync({
                courseId: exam.courseId,
                classId: exam.classId,
                academicPeriodId: exam.academicPeriodId || '',
                gradeType: examTypeToGradeType[exam.type],
                maxScore: parseFloat(exam.maxScore),
                coefficient: parseFloat(exam.coefficient),
                results: toCreate
            })
        }

        for (const update of toUpdate) {
            await updateGrade.mutateAsync(update)
        }

        setHasUnsavedChanges(false)
        setStudentGrades(prev => prev.map(sg => ({ ...sg, isDirty: false })))
    }

    const getScoreColor = (score: string, maxScore: string) => {
        if (!score) return "text-muted-foreground"
        const numScore = parseFloat(score)
        const numMax = parseFloat(maxScore)
        const percentage = (numScore / numMax) * 100
        
        if (percentage >= 80) return "text-green-600"
        if (percentage >= 60) return "text-blue-600"
        if (percentage >= 40) return "text-yellow-600"
        return "text-red-600"
    }

    const getScoreBadge = (score: string, maxScore: string) => {
        if (!score) return null
        const numScore = parseFloat(score)
        const numMax = parseFloat(maxScore)
        const percentage = (numScore / numMax) * 100
        
        if (percentage >= 50) {
            return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />{t("dashboard.exams.gradeEntry.pass")}</Badge>
        }
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />{t("dashboard.exams.gradeEntry.fail")}</Badge>
    }

    if (examLoading || studentsLoading || gradesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("dashboard.exams.gradeEntry.loading")}</div>
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("dashboard.exams.gradeEntry.examNotFound")}</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Exam Info Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{exam.title}</CardTitle>
                            <CardDescription className="mt-2">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Badge variant="outline">{exam.courseName}</Badge>
                                    </span>
                                    <span>• {exam.className}</span>
                                    <span>• Note max: {exam.maxScore}</span>
                                    <span>• Coeff: {exam.coefficient}</span>
                                </div>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {t("dashboard.exams.gradeEntry.unsavedChanges")}
                                </Badge>
                            )}
                            <Button onClick={handleSave} disabled={!hasUnsavedChanges || bulkCreateGrades.isPending}>
                                <Save className="w-4 h-4 mr-2" />
                                {t("dashboard.exams.gradeEntry.save")}
                            </Button>
                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    {t("dashboard.exams.gradeEntry.close")}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Grade Entry Grid */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
                            <div className="col-span-4">{t("dashboard.exams.gradeEntry.student")}</div>
                            <div className="col-span-2">{t("dashboard.exams.gradeEntry.score")} / {exam.maxScore}</div>
                            <div className="col-span-2">{t("dashboard.exams.gradeEntry.percentage")}</div>
                            <div className="col-span-2">{t("dashboard.exams.gradeEntry.status")}</div>
                            <div className="col-span-2">{t("dashboard.exams.gradeEntry.comment")}</div>
                                </div>

                        {/* Student Rows */}
                        {studentGrades.map((studentGrade) => (
                            <div
                                key={studentGrade.studentId}
                                className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-colors ${
                                    studentGrade.isDirty ? "bg-amber-50 border-amber-200" : "bg-card"
                                }`}
                            >
                                {/* Student Name */}
                                <div className="col-span-4 flex items-center">
                                    <div>
                                        <div className="font-medium text-sm">{studentGrade.studentName}</div>
                                        {studentGrade.grade && (
                                            <div className="text-xs text-muted-foreground">
                                                {t("dashboard.exams.gradeEntry.gradedOn")} {new Date(studentGrade.grade.gradedAt || "").toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Score Input */}
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max={exam.maxScore}
                                        value={studentGrade.score}
                                        onChange={(e) => handleScoreChange(studentGrade.studentId, e.target.value)}
                                        className={`text-sm ${getScoreColor(studentGrade.score, exam.maxScore)}`}
                                        placeholder="—"
                                    />
                                </div>

                                {/* Percentage */}
                                <div className="col-span-2 flex items-center text-sm">
                                    {studentGrade.score ? (
                                        <span className={getScoreColor(studentGrade.score, exam.maxScore)}>
                                            {((parseFloat(studentGrade.score) / parseFloat(exam.maxScore)) * 100).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-2 flex items-center">
                                    {getScoreBadge(studentGrade.score, exam.maxScore)}
                                </div>

                                {/* Comment */}
                                <div className="col-span-2">
                                    <Textarea
                                        value={studentGrade.comment}
                                        onChange={(e) => handleCommentChange(studentGrade.studentId, e.target.value)}
                                        placeholder={t("dashboard.exams.gradeEntry.addComment")}
                                        className="text-sm min-h-[60px] resize-none"
                                        rows={1}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                                {studentGrades.filter(sg => sg.score !== "").length} / {studentGrades.length} {t("dashboard.exams.gradeEntry.studentsGraded")}
                            </div>
                            <div className="flex items-center gap-4">
                                {studentGrades.filter(sg => sg.score !== "").length > 0 && (
                                    <div className="font-medium">
                                        {t("dashboard.exams.gradeEntry.average")}: {
                                            (studentGrades
                                                .filter(sg => sg.score !== "")
                                                .reduce((sum, sg) => sum + parseFloat(sg.score), 0) /
                                            studentGrades.filter(sg => sg.score !== "").length
                                            ).toFixed(2)
                                        } / {exam.maxScore}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
