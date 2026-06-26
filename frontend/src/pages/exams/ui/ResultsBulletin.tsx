import {
    useState,
    useMemo,
    useEffect
} from "react"
import { useTranslation } from "@shared/lib"
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui"
import {
    Download,
    TrendingUp,
    TrendingDown,
    Medal, Eye
} from "lucide-react"
import {
    useGrades,
    type StudentBulletin
} from "@entities/grades"
import { useParams } from "@tanstack/react-router"
import {useClasses} from "@entities/class";
import {useStudents} from "@entities/student";
import {downloadStudentPdf, openStudentPdf} from "@features/exams/ui/generateStudentPdf.ts";


export function ResultsBulletin() {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const { data: classes = [] } = useClasses(subSchoolId)

    const [selectedClassId, setSelectedClassId] = useState<string>("")

    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const { data: grades = [], isLoading: gradesLoading } = useGrades({
        classId: selectedClassId,
        subSchoolId
    })

    const { data: students = [] } = useStudents(subSchoolId)

    const [selectedPeriod, setSelectedPeriod] = useState("all")
    const [sortBy, setSortBy] = useState<"average" | "weighted" | "name">("weighted")

    const studentLookup = useMemo(() => {
        return new Map(students.map(s => [s.id, s]))
    }, [students])

    const studentResults = useMemo(() => {
        const studentMap = new Map<string, StudentBulletin>()

        grades.forEach(grade => {
            const student = studentLookup.get(grade.studentId)
            const existing = studentMap.get(grade.studentId)

            if (existing) {
                existing.grades.push(grade)
            } else {
                studentMap.set(grade.studentId, {
                    studentId:        grade.studentId,
                    studentFirstName: student?.firstName ?? "",
                    studentLastName:  student?.lastName  ?? "",
                    studentName:      student
                        ? `${student.firstName} ${student.lastName}`
                        : grade.studentId.slice(0, 8),
                    grades:           [grade],
                    average:          0,
                    weightedAverage:  0,
                    totalCoefficient: 0,
                    rank:             0,
                    classAverage:     0
                })
            }
        })

        const results = Array.from(studentMap.values()).map(result => {
            let totalScore = 0
            let totalMaxScore = 0
            let weightedSum = 0
            let totalCoefficient = 0

            result.grades.forEach(grade => {
                const score = parseFloat(grade.score)
                const maxScore = parseFloat(grade.maxScore)
                const coeff = parseFloat(grade.coefficient)

                totalScore += score
                totalMaxScore += maxScore
                weightedSum += (score / maxScore) * coeff
                totalCoefficient += coeff
            })

            const average = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 20 : 0
            const weightedAverage = totalCoefficient > 0 ? (weightedSum / totalCoefficient) * 20 : 0

            return {
                ...result,
                average,
                weightedAverage,
                totalCoefficient
            }
        })

        const sorted = [...results].sort((a, b) => b.weightedAverage - a.weightedAverage)
        sorted.forEach((result, index) => { result.rank = index + 1 })
        return sorted
    }, [grades])

    const sortedResults = useMemo(() => {
        const sorted = [...studentResults]
        switch (sortBy) {
            case "average":
                return sorted.sort((a, b) => b.average - a.average)
            case "weighted":
                return sorted.sort((a, b) => b.weightedAverage - a.weightedAverage)
            case "name":
                return sorted.sort((a, b) => a.studentLastName.localeCompare(b.studentLastName))
            default:
                return sorted
        }
    }, [studentResults, sortBy])

    const classStats = useMemo(() => {
        if (studentResults.length === 0) return null

        const averages = studentResults.map(s => s.weightedAverage)
        const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length
        const maxAverage = Math.max(...averages)
        const minAverage = Math.min(...averages)
        const passCount = studentResults.filter(s => s.weightedAverage >= 10).length
        const passRate = (passCount / studentResults.length) * 100

        return {
            classAverage,
            maxAverage,
            minAverage,
            passCount,
            passRate,
            totalStudents: studentResults.length
        }
    }, [studentResults])

    const getRankIcon = (rank?: number) => {
        if (!rank) return null

        if (rank === 1) return <Medal className="w-4 h-4 text-yellow-500" />
        if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />
        if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />

        return null
    }

    const getAverageColor = (average: number) => {
        if (average >= 16) return "text-green-600 bg-green-50"
        if (average >= 14) return "text-blue-600 bg-blue-50"
        if (average >= 12) return "text-cyan-600 bg-cyan-50"
        if (average >= 10) return "text-yellow-600 bg-yellow-50"
        return "text-red-600 bg-red-50"
    }

    const getTrendIcon = (average: number, classAverage: number) => {
        if (average > classAverage) return <TrendingUp className="w-4 h-4 text-green-600" />
        if (average < classAverage) return <TrendingDown className="w-4 h-4 text-red-600" />
        return null
    }

    if (gradesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("dashboard.exams.gradeEntry.loading")}</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{t("dashboard.exams.results.title")}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t("dashboard.exams.results.subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2">

                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t("dashboard.exams.results.selectClass")} />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t("dashboard.exams.results.period")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("dashboard.exams.results.allPeriods")}</SelectItem>
                            <SelectItem value="trimester1">{t("dashboard.exams.results.trimester1")}</SelectItem>
                            <SelectItem value="trimester2">{t("dashboard.exams.results.trimester2")}</SelectItem>
                            <SelectItem value="trimester3">{t("dashboard.exams.results.trimester3")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {t("dashboard.exams.results.export")}
                    </Button>
                </div>
            </div>

            {classStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{t("dashboard.exams.results.classAverage")}</CardDescription>
                            <CardTitle className="text-2xl">{classStats.classAverage.toFixed(2)}/20</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{t("dashboard.exams.results.bestAverage")}</CardDescription>
                            <CardTitle className="text-2xl text-green-600">{classStats.maxAverage.toFixed(2)}/20</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{t("dashboard.exams.results.passRate")}</CardDescription>
                            <CardTitle className="text-2xl">{classStats.passRate.toFixed(1)}%</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{t("dashboard.exams.results.students")}</CardDescription>
                            <CardTitle className="text-2xl">{classStats.totalStudents}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t("dashboard.exams.results.student")}</CardTitle>
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t("dashboard.exams.results.sortBy")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weighted">{t("dashboard.exams.results.weightedAverage")}</SelectItem>
                                <SelectItem value="average">{t("dashboard.exams.results.simpleAverage")}</SelectItem>
                                <SelectItem value="name">{t("dashboard.exams.results.name")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">{t("dashboard.exams.results.rank")}</TableHead>
                                <TableHead>{t("dashboard.exams.results.student")}</TableHead>
                                <TableHead className="text-center">{t("dashboard.exams.results.grades")}</TableHead>
                                <TableHead className="text-center">{t("dashboard.exams.results.totalCoefficient")}</TableHead>
                                <TableHead className="text-center">{t("dashboard.exams.results.average")}</TableHead>
                                <TableHead className="text-center">{t("dashboard.exams.results.weightedAvg")}</TableHead>
                                <TableHead className="text-center">{t("dashboard.exams.results.trend")}</TableHead>
                                <TableHead className="text-center">PDF</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedResults.map((result) => (
                                <TableRow key={result.studentId}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center justify-center">
                                            {result.rank}
                                            {result.rank != null && getRankIcon(result.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{result.studentName}</div>
                                        <div className="text-xs text-muted-foreground">{result.grades.length} {t("dashboard.exams.results.gradesCount")}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {result.grades.slice(0, 3).map((grade, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {grade.score}/{grade.maxScore}
                                                </Badge>
                                            ))}
                                            {result.grades.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{result.grades.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {result.totalCoefficient.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getAverageColor(result.average)}>
                                            {result.average.toFixed(2)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getAverageColor(result.weightedAverage)}>
                                            {result.weightedAverage.toFixed(2)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {classStats && getTrendIcon(result.weightedAverage, classStats.classAverage)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() => openStudentPdf(result)}
                                                title="Aperçu"
                                            >
                                                <Eye className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() => downloadStudentPdf(result)}
                                                title="Télécharger"
                                            >
                                                <Download className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
