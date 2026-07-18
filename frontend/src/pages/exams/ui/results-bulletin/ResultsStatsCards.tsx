import { useTranslation } from "@shared/lib"
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle
} from "@/shared/ui"

type ResultsStatsCardsProps = {
    classAverage: number
    maxAverage: number
    passRate: number
    totalStudents: number
}

export function ResultsStatsCards({
                                      classAverage,
                                      maxAverage,
                                      passRate,
                                      totalStudents
}: ResultsStatsCardsProps) {
    const { t } = useTranslation()

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">{t("dashboard.exams.results.classAverage")}</CardDescription>
                    <CardTitle className="text-2xl">{classAverage.toFixed(2)}/20</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">{t("dashboard.exams.results.bestAverage")}</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{maxAverage.toFixed(2)}/20</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">{t("dashboard.exams.results.passRate")}</CardDescription>
                    <CardTitle className="text-2xl">{passRate.toFixed(1)}%</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">{t("dashboard.exams.results.students")}</CardDescription>
                    <CardTitle className="text-2xl">{totalStudents}</CardTitle>
                </CardHeader>
            </Card>
        </div>
    )
}