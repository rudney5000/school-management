import {
    useState,
    useMemo
} from "react"
import { useTranslation } from "@shared/lib"
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/ui"
import {
    BarChart3,
    TrendingUp,
    Users,
    Award,
    Target,
    ArrowUp,
    ArrowDown,
    Sparkles,
    AlertTriangle,
    Lightbulb
} from "lucide-react"
import { useGrades } from "@entities/grades"
import { useExams } from "@entities/exams"
import { useParams } from "@tanstack/react-router"
import {StatCard} from "@/pages/exams/ui/StatCard";

const distributionColors: Record<string, string> = {
    '0-5': 'bg-red-500',
    '5-10': 'bg-orange-500',
    '10-12': 'bg-amber-500',
    '12-14': 'bg-blue-400',
    '14-16': 'bg-blue-600',
    '16-20': 'bg-emerald-500',
}

function gradeLevel(score: number) {
    if (score >= 16) return { label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    if (score >= 14) return { label: 'Très bien', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    if (score >= 12) return { label: 'Bien', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
    if (score >= 10) return { label: 'Assez bien', color: 'bg-amber-50 text-amber-700 border-amber-200' }
    return { label: 'Insuffisant', color: 'bg-red-50 text-red-700 border-red-200' }
}

export function StatisticsDashboard() {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const [selectedClassId, setSelectedClassId] = useState<string>("")
    const { data: grades = [], isLoading: gradesLoading } = useGrades({ classId: selectedClassId, subSchoolId })
    const { data: exams = [], isLoading: examsLoading } = useExams(subSchoolId)
    
    const [selectedExamId, setSelectedExamId] = useState<string>("all")
    const [comparisonMode, setComparisonMode] = useState<"none" | "class" | "period">("none")

    const overallStats = useMemo(() => {
        if (grades.length === 0) return null

        const scores = grades.map(g => (parseFloat(g.score) / parseFloat(g.maxScore)) * 20)
        const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
        const median = [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)]
        const min = Math.min(...scores)
        const max = Math.max(...scores)
        const passCount = scores.filter(s => s >= 10).length
        const passRate = (passCount / scores.length) * 100

        const distribution = [
            { range: "0-5", count: scores.filter(s => s < 5).length },
            { range: "5-10", count: scores.filter(s => s >= 5 && s < 10).length },
            { range: "10-12", count: scores.filter(s => s >= 10 && s < 12).length },
            { range: "12-14", count: scores.filter(s => s >= 12 && s < 14).length },
            { range: "14-16", count: scores.filter(s => s >= 14 && s < 16).length },
            { range: "16-20", count: scores.filter(s => s >= 16).length },
        ].map(d => ({
            ...d,
            percentage: (d.count / scores.length) * 100
        }))

        return {
            average,
            median,
            min,
            max,
            passRate,
            distribution,
            totalGrades: scores.length,
            passCount
        }
    }, [grades])

    const examComparison = useMemo(() => {
        return exams
            .map((exam) => {
                const examGrades = grades.filter((g) => g.courseId === exam.courseId && g.classId === exam.classId)
                if (examGrades.length === 0) return null
                const scores = examGrades.map((g) => (parseFloat(g.score) / parseFloat(g.maxScore)) * 20)
                return {
                    examId: exam.id,
                    examTitle: exam.title,
                    courseName: exam.courseName,
                    average: scores.reduce((s, v) => s + v, 0) / scores.length,
                    passRate: (scores.filter((s) => s >= 10).length / scores.length) * 100,
                    studentCount: examGrades.length,
                }
            })
            .filter(Boolean) as {
            examId: string
            examTitle: string
            courseName: string
            average: number
            passRate: number
            studentCount: number
        }[]
    }, [exams, grades])

    // const getDistributionColor = (range: string) => {
    //     switch (range) {
    //         case "0-5": return "bg-red-500"
    //         case "5-10": return "bg-orange-500"
    //         case "10-12": return "bg-yellow-500"
    //         case "12-14": return "bg-blue-400"
    //         case "14-16": return "bg-blue-600"
    //         case "16-20": return "bg-green-500"
    //         default: return "bg-gray-500"
    //     }
    // }

    const getGradeLevel = (score: number) => {
        if (score >= 16) return { label: "Excellent", color: "text-green-600 bg-green-50" }
        if (score >= 14) return { label: "Très bien", color: "text-blue-600 bg-blue-50" }
        if (score >= 12) return { label: "Bien", color: "text-cyan-600 bg-cyan-50" }
        if (score >= 10) return { label: "Assez bien", color: "text-yellow-600 bg-yellow-50" }
        return { label: "Insuffisant", color: "text-red-600 bg-red-50" }
    }

    if (gradesLoading || examsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("dashboard.exams.gradeEntry.loading")}</div>
            </div>
        )
    }

    const currentStats = overallStats

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Statistiques & analyse</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble des performances académiques.</p>
                </div>
                <Select value={comparisonMode} onValueChange={(v) => setComparisonMode(v as typeof comparisonMode)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Mode de comparaison" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Aucune comparaison</SelectItem>
                        <SelectItem value="class">Par classe</SelectItem>
                        <SelectItem value="period">Par période</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Moyenne" value={`${currentStats?.average.toFixed(2)}/20`} icon={BarChart3} accent="primary" />
                <StatCard label="Médiane" value={`${currentStats?.median.toFixed(2)}/20`} icon={Target} accent="blue" />
                <StatCard label="Taux de réussite" value={`${currentStats?.passRate.toFixed(1)}%`} icon={TrendingUp} accent="emerald" />
                <StatCard label="Meilleure note" value={`${currentStats?.max.toFixed(2)}/20`} icon={Award} accent="emerald" />
                <StatCard label="Évaluations" value={currentStats?.totalGrades} icon={Users} accent="amber" />
            </div>

            {/* Distribution + Performance levels */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution des notes</CardTitle>
                        <CardDescription>Répartition des élèves par tranche de score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentStats?.distribution.map((item) => (
                            <div key={item.range} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{item.range}/20</span>
                                    <span className="text-muted-foreground">{item.count} élèves · {item.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${distributionColors[item.range]}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Niveaux de performance</CardTitle>
                        <CardDescription>Classification des résultats</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {[
                            { label: 'Excellent', range: '16-20', min: 16, max: 20 },
                            { label: 'Très bien', range: '14-16', min: 14, max: 16 },
                            { label: 'Bien', range: '12-14', min: 12, max: 14 },
                            { label: 'Assez bien', range: '10-12', min: 10, max: 12 },
                            { label: 'Insuffisant', range: '0-10', min: 0, max: 10 },
                        ].map((level) => {
                            const count = currentStats?.distribution
                                .filter((d) => {
                                    const [min, max] = d.range.split('-').map(Number)
                                    return min >= level.min && max <= level.max
                                })
                                .reduce((sum, d) => sum + d.count, 0) || 0
                            const pct = (count / (currentStats?.totalGrades || 1)) * 100
                            const gl = gradeLevel((level.min + level.max) / 2)
                            return (
                                <div key={level.label} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2.5 transition-colors hover:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <Badge className={gl.color}>{count}</Badge>
                                        <span className="text-sm font-medium">{level.label}</span>
                                        <span className="text-xs text-muted-foreground">{level.range}</span>
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{pct.toFixed(1)}%</span>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Exam comparison */}
            {comparisonMode !== 'none' && examComparison.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Comparaison par examen</CardTitle>
                        <CardDescription>Performance moyenne pour chaque évaluation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {examComparison.map((exam) => {
                            const gl = gradeLevel(exam.average)
                            return (
                                <div key={exam.examId} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/40">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-foreground">{exam.examTitle}</div>
                                        <div className="text-xs text-muted-foreground">{exam.courseName}</div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">Moyenne</div>
                                            <Badge className={gl.color}>{exam.average.toFixed(2)}/20</Badge>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">Réussite</div>
                                            <div className="flex items-center gap-1">
                                                {exam.passRate >= 50 ? (
                                                    <ArrowUp className="size-4 text-emerald-600" />
                                                ) : (
                                                    <ArrowDown className="size-4 text-red-600" />
                                                )}
                                                <span className="text-sm font-medium">{exam.passRate.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">Élèves</div>
                                            <div className="text-sm font-medium">{exam.studentCount}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Analyse & recommandations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {currentStats && currentStats.passRate >= 70 && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <Sparkles className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                            <div>
                                <div className="text-sm font-semibold text-emerald-900">Excellente performance</div>
                                <div className="text-sm text-emerald-700">Le taux de réussite de {currentStats.passRate.toFixed(1)}% dépasse le seuil cible. Continuez sur cette lancée.</div>
                            </div>
                        </div>
                    )}
                    {currentStats && currentStats.passRate < 50 && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
                            <div>
                                <div className="text-sm font-semibold text-red-900">Attention requise</div>
                                <div className="text-sm text-red-700">Le taux de réussite est de {currentStats.passRate.toFixed(1)}%. Un soutien pédagogique est recommandé.</div>
                            </div>
                        </div>
                    )}
                    {currentStats && currentStats.average >= 12 && currentStats.passRate >= 60 && (
                        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <Lightbulb className="mt-0.5 size-5 shrink-0 text-blue-600" />
                            <div>
                                <div className="text-sm font-semibold text-blue-900">Bonne progression</div>
                                <div className="text-sm text-blue-700">La moyenne générale ({currentStats.average.toFixed(2)}/20) et le taux de réussite sont au-dessus des attentes.</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
