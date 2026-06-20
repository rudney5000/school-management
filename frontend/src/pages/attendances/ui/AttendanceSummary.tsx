import { Zap, TrendingUp } from "lucide-react"
import {
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
} from "@/shared/ui"
import { useTranslation } from "@shared/lib"

interface AttendanceSummaryProps {
    summaryPeriod: string
    onSummaryPeriodChange: (value: string) => void
}

export function AttendanceSummary({ summaryPeriod, onSummaryPeriodChange }: AttendanceSummaryProps) {
    const { t } = useTranslation()

    return (
        <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{t('dashboard.attendance.summary.title')}</h2>
                <Select value={summaryPeriod} onValueChange={onSummaryPeriodChange}>
                    <SelectTrigger className="h-8 w-24 text-xs gap-1 border border-border rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Today">{t('dashboard.attendance.summary.periods.today')}</SelectItem>
                        <SelectItem value="This Week">{t('dashboard.attendance.summary.periods.week')}</SelectItem>
                        <SelectItem value="This Month">{t('dashboard.attendance.summary.periods.month')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)" }}>
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold opacity-90">{t('dashboard.attendance.table.tabs.students')}</p>
                        <Zap className="size-8 opacity-20" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">1,180</span>
                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                            <TrendingUp className="size-3 mr-0.5" />
                            94.8%
                        </Badge>
                    </div>
                    <p className="text-xs opacity-75">{t('dashboard.attendance.summary.stats.totalPresent')}</p>
                    <Separator className="my-3 bg-white/20" />
                    <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                            <p className="font-semibold text-sm">1,090</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.onTime')}</p>
                            <p className="text-[10px] opacity-70">87.5%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">90</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.late')}</p>
                            <p className="text-[10px] opacity-70">7.2%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">65</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.absent')}</p>
                            <p className="text-[10px] opacity-70">5.2%</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)" }}>
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold opacity-90">{t('dashboard.attendance.table.tabs.teachers')}</p>
                        <Zap className="size-8 opacity-20" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">80</span>
                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                            <TrendingUp className="size-3 mr-0.5" />
                            93.0%
                        </Badge>
                    </div>
                    <p className="text-xs opacity-75">{t('dashboard.attendance.summary.stats.totalPresent')}</p>
                    <Separator className="my-3 bg-white/20" />
                    <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                            <p className="font-semibold text-sm">75</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.onTime')}</p>
                            <p className="text-[10px] opacity-70">87.2%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">5</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.late')}</p>
                            <p className="text-[10px] opacity-70">5.8%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">6</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.absent')}</p>
                            <p className="text-[10px] opacity-70">7.0%</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, #1e3a8a 0%, #1755EC 100%)` }}>
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold opacity-90">{t('dashboard.attendance.table.tabs.staff')}</p>
                        <Zap className="size-8 opacity-20" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">32</span>
                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                            <TrendingUp className="size-3 mr-0.5" />
                            91.4%
                        </Badge>
                    </div>
                    <p className="text-xs opacity-75">{t('dashboard.attendance.summary.stats.totalPresent')}</p>
                    <Separator className="my-3 bg-white/20" />
                    <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                            <p className="font-semibold text-sm">29</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.onTime')}</p>
                            <p className="text-[10px] opacity-70">82.9%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">3</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.late')}</p>
                            <p className="text-[10px] opacity-70">8.5%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">2</p>
                            <p className="text-[10px] opacity-70">{t('dashboard.attendance.summary.stats.absent')}</p>
                            <p className="text-[10px] opacity-70">5.7%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}