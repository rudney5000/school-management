import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui"
import { AttendanceOverviewChart } from "./AttendanceOverviewChart"
import { useTranslation } from "@shared/lib"

interface AttendanceOverviewProps {
    overviewPeriod: string
    onOverviewPeriodChange: (value: string) => void
    chartData: any
    accent: string
}

export function AttendanceOverview({
                                       overviewPeriod,
                                       onOverviewPeriodChange,
                                       chartData,
                                       accent
}: AttendanceOverviewProps) {
    const { t } = useTranslation()

    return (
        <div className="w-full lg:w-[340px] shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm" style={{ boxShadow: `0 4px 24px 0 ${accent}18` }}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">{t('dashboard.attendance.overview.title')}</h2>
                <Select value={overviewPeriod} onValueChange={onOverviewPeriodChange}>
                    <SelectTrigger className="h-7 w-36 text-xs gap-1 border border-border rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Last Semester">{t('dashboard.attendance.overview.periods.lastSemester')}</SelectItem>
                        <SelectItem value="This Year">{t('dashboard.attendance.overview.periods.thisYear')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <AttendanceOverviewChart data={chartData} />
        </div>
    )
}