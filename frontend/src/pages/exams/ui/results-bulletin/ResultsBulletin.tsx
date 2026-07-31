import {PenLine} from "lucide-react";
import { useTranslation } from "@shared/lib"
import {
    Button,
    Spinner
} from "@/shared/ui"
import { useResultsBulletin } from "./model/useResultsBulletin"
import { ResultsFilterBar } from "./ResultsFilterBar"
import { ResultsStatsCards } from "./ResultsStatsCards"
import { ResultsTable } from "./ResultsTable"
import {useAppSelector} from "@shared/store/hooks";
import {selectRole} from "@features/auth/model/selectors";
import {
    useSignBulletinBatch
} from "@entities/document-signature";

const STAFF_ROLES = ['director', 'admin', 'super_admin']
export function ResultsBulletin() {
    const { t } = useTranslation()
    const resultsLabels = {
        pdfUnavailable: t("dashboard.exams.results.pdfUnavailable"),
        preview: t("dashboard.exams.results.preview"),
        download: t("dashboard.exams.results.download"),
        sign: t("dashboard.exams.results.sign"),
        reSign: t("dashboard.exams.results.reSign"),
        notSigned: t("dashboard.exams.results.notSigned"),
    }
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
        isOpeningPdfForStudent,
        isDownloadingPdfForStudent,
        handleSignStudent,
        isSigning,
        subSchoolId,
        isPeriodSelected,
    } = useResultsBulletin()

    const userRole = useAppSelector(selectRole)
    const isStaff = !!userRole && STAFF_ROLES.includes(userRole)
    const canSign = !!userRole && ['teacher', ...STAFF_ROLES].includes(userRole)

    const signBatchMutation = useSignBulletinBatch()

    const handleSignBatch = () => {
        if (!subSchoolId || !isPeriodSelected) return
        signBatchMutation.mutate({
            subSchoolId,
            classId: selectedClassId,
            academicPeriodId: selectedPeriod,
        })
    }

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
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{t("dashboard.exams.results.title")}</h2>
                        <p className="text-muted-foreground mt-1">{t("dashboard.exams.results.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isStaff && (
                            <Button
                                variant="outline"
                                onClick={handleSignBatch}
                                disabled={!isPeriodSelected || signBatchMutation.isPending}
                            >
                                <PenLine className="size-4 mr-2" />
                                Signer les bulletins de la classe
                            </Button>
                        )}
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
                labels={resultsLabels}
                onOpenPdf={handleOpenPdf}
                onDownloadPdf={handleDownloadPdf}
                canSign={canSign}
                onSignStudent={handleSignStudent}
                isSigning={isSigning}
                isOpeningPdfForStudent={isOpeningPdfForStudent}
                isDownloadingPdfForStudent={isDownloadingPdfForStudent}
            />
        </div>
    )
}