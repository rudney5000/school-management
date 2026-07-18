import { useTranslation } from "@shared/lib"
import { Spinner } from "@/shared/ui"
import { useResultsBulletin } from "./model/useResultsBulletin"
import { ResultsFilterBar } from "./ResultsFilterBar"
import { ResultsStatsCards } from "./ResultsStatsCards"
import { ResultsTable } from "./ResultsTable"
import {
    ElephantWatermark
} from "@/pages/exams/ui/results-bulletin/ElephantWatermark";

export function ResultsBulletin() {
    const { t } = useTranslation()
    const {
        classes,
        academicPeriods,
        selectedClassId,
        setSelectedClassId,
        selectedPeriod,
        setSelectedPeriod,
        sortBy,
        setSortBy,
        sortedResults,
        classStats,
        canGeneratePdf,
        gradesLoading,
        handleOpenPdf,
        handleDownloadPdf,
    } = useResultsBulletin()

    if (gradesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">
                    <Spinner />
                    {t("dashboard.exams.gradeEntry.loading")}
                </div>
            </div>
        )
    }

    return (
        <div className="relative space-y-6">
            <ElephantWatermark
                className="pointer-events-none absolute -right-12 top-0 w-80 h-80 text-amber-900/5 dark:text-amber-100/5 z-0"
            />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{t("dashboard.exams.results.title")}</h2>
                        <p className="text-muted-foreground mt-1">{t("dashboard.exams.results.subtitle")}</p>
                    </div>
                    <ResultsFilterBar
                        classes={classes}
                        academicPeriods={academicPeriods}
                        selectedClassId={selectedClassId}
                        onClassChange={setSelectedClassId}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />
                </div>
            </div>

            {classStats && (
                <ResultsStatsCards
                    classAverage={classStats.classAverage}
                    maxAverage={classStats.maxAverage}
                    passRate={classStats.passRate}
                    totalStudents={classStats.totalStudents}
                />
            )}

            <ResultsTable
                sortedResults={sortedResults}
                classAverage={classStats?.classAverage}
                sortBy={sortBy}
                onSortChange={setSortBy}
                canGeneratePdf={canGeneratePdf}
                pdfDisabledLabel={t("dashboard.exams.results.selectPeriodFirst")}
                onOpenPdf={handleOpenPdf}
                onDownloadPdf={handleDownloadPdf}
            />
        </div>
    )
}