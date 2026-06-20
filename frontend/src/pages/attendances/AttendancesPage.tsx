import {useState, useEffect, useMemo} from "react"
import { Search } from "lucide-react"
import { useParams } from "@tanstack/react-router"
import { useDispatch, useSelector } from "react-redux"
import { AttendanceSummary } from "@/pages/attendances/ui/AttendanceSummary"
import { AttendanceOverview } from "@/pages/attendances/ui/AttendanceOverview"
import { AttendanceTable } from "@/pages/attendances/ui/attendance-table/AttendanceTable.tsx"
import { useAttendanceData } from "@/pages/attendances/lib/useAttendanceData"
import { getWorkdays } from "@/pages/attendances/lib/dateUtils"
import { useClasses } from "@entities/class"
import { useParents } from "@entities/parent"
import { useTeachers } from "@entities/teacher"
import {selectActiveTab} from "@entities/attendances";
import {format} from "date-fns";
import {useDateLocale} from "@shared/lib/date";
import {endOfMonth} from "date-fns/endOfMonth";
import {useTranslation} from "@shared/lib";

const ACCENT = "#1755EC"

export default function AttendancePage() {
    const dateLocale = useDateLocale()
    const { t } = useTranslation()
    const now = new Date()
    const dispatch = useDispatch()
    const { subSchoolId } = useParams({ strict: false })
    const activeTab = useSelector(selectActiveTab)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [selectedClass, setSelectedClass] = useState<string>("")
    const [summaryPeriod, setSummaryPeriod] = useState("Today")
    const [overviewPeriod, setOverviewPeriod] = useState("Last Semester")

    const monthOptions = useMemo(() =>
            Array.from({ length: 3 }, (_, i) => {
                const d = new Date()
                d.setMonth(d.getMonth() - i)
                return {
                    label: format(d, 'MMM yyyy', { locale: dateLocale }),
                    year: d.getFullYear(),
                    month: d.getMonth() + 1,
                }
            }),
        [dateLocale])

    const [selectedMonthLabel, setSelectedMonthLabel] = useState(monthOptions[0].label)

    const { selectedYear, selectedMonth } = useMemo(() => {
        const found = monthOptions.find(o => o.label === selectedMonthLabel)
        return {
            selectedYear:  found?.year  ?? now.getFullYear(),
            selectedMonth: found?.month ?? now.getMonth() + 1,
        }
    }, [selectedMonthLabel, monthOptions])

    const workdays = useMemo(
        () => getWorkdays(selectedYear, selectedMonth),
        [selectedYear, selectedMonth]
    )

    const fromDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const toDate = format(endOfMonth(new Date(selectedYear, selectedMonth - 1)), 'yyyy-MM-dd')

    const { data: classes = [] } = useClasses(subSchoolId)
    const { data: parents = [] } = useParents(subSchoolId)
    const { data: teachers = [] } = useTeachers(subSchoolId)
    const { students, attendanceMap, chartData, loading } = useAttendanceData(subSchoolId, fromDate, toDate)

    useEffect(() => {
        if (classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0].id)
        }
    }, [classes, selectedClass])

    const tabData = useMemo(() => {
        switch (activeTab) {
            case "students":
                return students.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, type: "student" as const }))
            case "teachers":
                return teachers.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}`, type: "teacher" as const }))
            case "staff":
                return parents.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, type: "parent" as const }))
            default:
                return []
        }
    }, [activeTab, students, teachers, parents])

    const totalPages = Math.ceil(tabData.length / pageSize)
    const pagedTabData = tabData.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground">{t('dashboard.attendance.title')}</h1>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground w-full sm:w-52">
                            <Search className="size-4 shrink-0" />
                            <span>{t('dashboard.attendance.search')}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-5 mb-5">
                        <AttendanceSummary summaryPeriod={summaryPeriod} onSummaryPeriodChange={setSummaryPeriod} />

                        <AttendanceOverview overviewPeriod={overviewPeriod} onOverviewPeriodChange={setOverviewPeriod} chartData={chartData} accent={ACCENT} />
                    </div>

                    <AttendanceTable
                        activeTab={activeTab}
                        classes={classes}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        selectedMonth={selectedMonthLabel}
                        setSelectedMonth={setSelectedMonthLabel}
                        workdays={workdays}
                        loading={loading}
                        pagedTabData={pagedTabData}
                        attendanceMap={attendanceMap}
                        tabData={tabData}
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        accent={ACCENT}
                        dispatch={dispatch}
                        monthOptions={monthOptions.map(o => o.label)}
                    />
                </main>
            </div>
        </div>
    )
}
