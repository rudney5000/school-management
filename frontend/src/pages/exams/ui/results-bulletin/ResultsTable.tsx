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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui"
import {
    Download,
    Eye
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

type ResultsTableProps = {
    sortedResults: StudentBulletin[]
    classAverage?: number
    sortBy: SortBy
    onSortChange: (value: SortBy) => void
    canGeneratePdf: boolean
    pdfDisabledLabel: string
    onOpenPdf: (result: StudentBulletin) => void
    onDownloadPdf: (result: StudentBulletin) => void
}

export function ResultsTable({
                                 sortedResults,
                                 classAverage,
                                 sortBy,
                                 onSortChange,
                                 canGeneratePdf,
                                 pdfDisabledLabel,
                                 onOpenPdf,
                                 onDownloadPdf
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
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost" size="icon" className="size-7"
                                            onClick={() => onOpenPdf(result)}
                                            title={canGeneratePdf ? "Aperçu" : pdfDisabledLabel}
                                            disabled={!canGeneratePdf}
                                        >
                                            <Eye className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="icon" className="size-7"
                                            onClick={() => onDownloadPdf(result)}
                                            title={canGeneratePdf ? "Télécharger" : pdfDisabledLabel}
                                            disabled={!canGeneratePdf}
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
    )
}