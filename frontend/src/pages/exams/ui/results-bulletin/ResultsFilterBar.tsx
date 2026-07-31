import { useTranslation } from "@shared/lib"
import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/ui"
import { Download } from "lucide-react"
import type { Class } from "@entities/class"
import type { AcademicPeriod } from "@entities/academic-period"

type ResultsFilterBarProps = {
    classes: Class[]
    academicPeriods: AcademicPeriod[]
    selectedClassId: string
    onClassChange: (id: string) => void
    selectedPeriod: string
    onPeriodChange: (id: string) => void
}

export function ResultsFilterBar({
                                     classes,
                                     academicPeriods,
                                     selectedClassId,
                                     onClassChange,
                                     selectedPeriod,
                                     onPeriodChange
}: ResultsFilterBarProps) {
    const { t } = useTranslation()

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedClassId} onValueChange={onClassChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("dashboard.exams.results.selectClass")} />
                </SelectTrigger>
                <SelectContent>
                    {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("dashboard.exams.results.period")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("dashboard.exams.results.allPeriods")}</SelectItem>
                    {academicPeriods.map(period => (
                        <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t("dashboard.exams.results.export")}
            </Button>
        </div>
    )
}