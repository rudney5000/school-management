import { useTranslation } from "@shared/lib"
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui"
import {
    Download,
    Eye,
    PenLine
} from "lucide-react"
import type { StudentBulletin } from "@entities/grades"
import {
    getAverageColor,
    getRankIcon,
    getTrendIcon
} from "@/pages/exams/ui/results-bulletin/model/resultsBulletin.utils";
import type {
    SortBy
} from "@/pages/exams/ui/results-bulletin/model/useResultsBulletin";
import {
    SignatureBadge,
    type SignatureStatusResult
} from "@entities/document-signature";

type BulletinRow = StudentBulletin & { signatureStatus?: SignatureStatusResult }

type ResultsTableLabels = {
    pdfUnavailable: string
    preview: string
    download: string
    sign: string
    reSign: string
    notSigned: string
}

type ResultsTableProps = {
    sortedResults: BulletinRow[]
    classAverage?: number
    sortBy: SortBy
    onSortChange: (value: SortBy) => void
    canGeneratePdf: boolean
    labels: ResultsTableLabels
    onOpenPdf: (result: StudentBulletin) => void
    onDownloadPdf: (result: StudentBulletin) => void
    canSign: boolean
    onSignStudent: (studentId: string) => void
    isSigning: boolean
    isOpeningPdfForStudent: (studentId: string) => boolean
    isDownloadingPdfForStudent: (studentId: string) => boolean
}
export function ResultsTable({
                                 sortedResults,
                                 classAverage,
                                 sortBy,
                                 onSortChange,
                                 canGeneratePdf,
                                 labels,
                                 onOpenPdf,
                                 onDownloadPdf,
                                 canSign,
                                 onSignStudent,
                                 isSigning,
                                 isOpeningPdfForStudent,
                                 isDownloadingPdfForStudent,
}: ResultsTableProps) {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t("dashboard.exams.results.student")}</CardTitle>
                    <Select value={sortBy} onValueChange={(value: SortBy) => onSortChange(value)}>
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
                            <TableHead className="text-center">{t("dashboard.exams.results.signature")}</TableHead>
                            <TableHead className="text-center">{t("dashboard.exams.results.pdf")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedResults.map((result) => {
                            const status = result.signatureStatus
                            const isSigned = !!status?.isSigned
                            const isStale = isSigned && status.isSigned && status.isStale
                            const canDownloadRow = canGeneratePdf && isSigned && !isStale
                            const isOpening = isOpeningPdfForStudent(result.studentId)
                            const isDownloading = isDownloadingPdfForStudent(result.studentId)

                            return (
                                <TableRow key={result.studentId}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center justify-center">
                                            {result.rank}
                                            {result.rank != null && getRankIcon(result.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{result.studentName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {result.grades.length} {t("dashboard.exams.results.gradesCount")}
                                        </div>
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
                                    <TableCell className="text-center">{result.totalCoefficient.toFixed(1)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getAverageColor(result.average)}>{result.average.toFixed(2)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={getAverageColor(result.weightedAverage)}>{result.weightedAverage.toFixed(2)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {classAverage != null && getTrendIcon(result.weightedAverage, classAverage)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {status ? <SignatureBadge status={status} /> : <Badge variant="outline">…</Badge>}
                                            {canSign && (!isSigned || isStale) && (
                                                <Button
                                                    variant="ghost" size="icon" className="size-6"
                                                    onClick={() => onSignStudent(result.studentId)}
                                                    disabled={isSigning}
                                                    title={isStale ? t("dashboard.exams.results.reSign") : t("dashboard.exams.results.sign")}
                                                >
                                                    <PenLine className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost" size="icon" className="size-7"
                                                onClick={() => onOpenPdf(result)}
                                                title={
                                                    canDownloadRow
                                                        ? labels.preview
                                                        : (isSigned ? labels.pdfUnavailable : labels.notSigned)
                                                }
                                                disabled={!canDownloadRow || isOpening}
                                            >
                                                {isOpening
                                                    ? <Spinner className="size-3.5" />
                                                    : <Eye className="size-3.5" />}
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon" className="size-7"
                                                onClick={() => onDownloadPdf(result)}
                                                title={
                                                    canDownloadRow
                                                        ? labels.download
                                                        : (isSigned ? labels.pdfUnavailable : labels.notSigned)
                                                }
                                                disabled={!canDownloadRow || isDownloading}
                                            >
                                                {isDownloading
                                                    ? <Spinner className="size-3.5" />
                                                    : <Download className="size-3.5" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}