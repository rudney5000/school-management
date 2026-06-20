import { useState, useEffect } from "react"
import {
    Search,
    TrendingUp,
    ArrowLeft,
    ArrowRight,
    Zap
} from "lucide-react"
import {
    Badge,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/shared/ui"
import { useParams } from "@tanstack/react-router"
import { useDispatch, useSelector } from "react-redux"

import { AttendanceOverviewChart } from "@/pages/attendances/ui/AttendanceOverviewChart"
import { StatusIcon } from "@/pages/attendances/ui/StatusIcon"
import { useAttendanceData } from "@/pages/attendances/lib/useAttendanceData"
import { getWorkdays, formatDateLabel, formatDateKey } from "@/pages/attendances/lib/dateUtils"
import { setActiveTab } from "@entities/attendances/model/slice"
import { selectActiveTab } from "@entities/attendances/model/selectors"
import { useClasses } from "@entities/class"
import { useParents } from "@entities/parent"
import { useTeachers } from "@entities/teacher"

const ACCENT = "#1755EC"

export default function AttendancePage() {
    const dispatch = useDispatch()
    const { subSchoolId } = useParams({ strict: false })
    const activeTab = useSelector(selectActiveTab)
    
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [selectedClass, setSelectedClass] = useState<string>("")
    const [selectedMonth, setSelectedMonth] = useState("Mar 2035")
    const [summaryPeriod, setSummaryPeriod] = useState("Today")
    const [overviewPeriod, setOverviewPeriod] = useState("Last Semester")

    const MONTH_YEAR = { month: 3, year: 2035 }
    const workdays = getWorkdays(MONTH_YEAR.year, MONTH_YEAR.month)

    const fromDate = `${MONTH_YEAR.year}-${String(MONTH_YEAR.month).padStart(2, '0')}-01`
    const toDate = `${MONTH_YEAR.year}-${String(MONTH_YEAR.month).padStart(2, '0')}-${new Date(MONTH_YEAR.year, MONTH_YEAR.month, 0).getDate()}`

    const { data: classes = [] } = useClasses(subSchoolId)
    const { data: parents = [] } = useParents(subSchoolId)
    const { data: teachers = [] } = useTeachers(subSchoolId)
    const { students, attendanceMap, chartData, loading } = useAttendanceData(subSchoolId, fromDate, toDate)

    // Set initial class when classes are loaded
    useEffect(() => {
        if (classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0].id)
        }
    }, [classes, selectedClass])

    // Get data based on active tab
    const getTabData = () => {
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
    }

    const tabData = getTabData()
    const totalPages = Math.ceil(tabData.length / pageSize)
    const pagedTabData = tabData.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-foreground">Attendance</h1>
                        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span className="hover:text-foreground cursor-pointer">Dashboard</span>
                            <span>/</span>
                            <span style={{ color: ACCENT }}>Attendance</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground w-full sm:w-52">
                            <Search className="size-4 shrink-0" />
                            <span>Search anything</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    {/* Top section: Summary + Overview */}
                    <div className="flex flex-col lg:flex-row gap-5 mb-5">
                        {/* Attendance Summary */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                                <h2 className="text-sm font-semibold text-foreground">Attendance Summary</h2>
                                <Select value={summaryPeriod} onValueChange={setSummaryPeriod}>
                                    <SelectTrigger className="h-8 w-24 text-xs gap-1 border border-border rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Today">Today</SelectItem>
                                        <SelectItem value="This Week">This Week</SelectItem>
                                        <SelectItem value="This Month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Students card */}
                                <div className="rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)" }}>
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-semibold opacity-90">Students</p>
                                        <Zap className="size-8 opacity-20" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-bold">1,180</span>
                                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                                            <TrendingUp className="size-3 mr-0.5" />
                                            94.8%
                                        </Badge>
                                    </div>
                                    <p className="text-xs opacity-75">Total Present</p>
                                    <Separator className="my-3 bg-white/20" />
                                    <div className="grid grid-cols-3 gap-1 text-center">
                                        <div>
                                            <p className="font-semibold text-sm">1,090</p>
                                            <p className="text-[10px] opacity-70">On-Time</p>
                                            <p className="text-[10px] opacity-70">87.5%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">90</p>
                                            <p className="text-[10px] opacity-70">Late</p>
                                            <p className="text-[10px] opacity-70">7.2%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">65</p>
                                            <p className="text-[10px] opacity-70">Absent</p>
                                            <p className="text-[10px] opacity-70">5.2%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Teachers card */}
                                <div className="rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)" }}>
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-semibold opacity-90">Teachers</p>
                                        <Zap className="size-8 opacity-20" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-bold">80</span>
                                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                                            <TrendingUp className="size-3 mr-0.5" />
                                            93.0%
                                        </Badge>
                                    </div>
                                    <p className="text-xs opacity-75">Total Present</p>
                                    <Separator className="my-3 bg-white/20" />
                                    <div className="grid grid-cols-3 gap-1 text-center">
                                        <div>
                                            <p className="font-semibold text-sm">75</p>
                                            <p className="text-[10px] opacity-70">On-Time</p>
                                            <p className="text-[10px] opacity-70">87.2%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">5</p>
                                            <p className="text-[10px] opacity-70">Late</p>
                                            <p className="text-[10px] opacity-70">5.8%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">6</p>
                                            <p className="text-[10px] opacity-70">Absent</p>
                                            <p className="text-[10px] opacity-70">7.0%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Staff card */}
                                <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, #1e3a8a 0%, #1755EC 100%)` }}>
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-semibold opacity-90">Staff</p>
                                        <Zap className="size-8 opacity-20" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-bold">32</span>
                                        <Badge className="text-[10px] px-1.5 py-0 h-5 bg-white/20 text-white border-0 font-medium">
                                            <TrendingUp className="size-3 mr-0.5" />
                                            91.4%
                                        </Badge>
                                    </div>
                                    <p className="text-xs opacity-75">Total Present</p>
                                    <Separator className="my-3 bg-white/20" />
                                    <div className="grid grid-cols-3 gap-1 text-center">
                                        <div>
                                            <p className="font-semibold text-sm">29</p>
                                            <p className="text-[10px] opacity-70">On-Time</p>
                                            <p className="text-[10px] opacity-70">82.9%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">3</p>
                                            <p className="text-[10px] opacity-70">Late</p>
                                            <p className="text-[10px] opacity-70">8.5%</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">2</p>
                                            <p className="text-[10px] opacity-70">Absent</p>
                                            <p className="text-[10px] opacity-70">5.7%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Overview Chart */}
                        <div className="w-full lg:w-[340px] shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm" style={{ boxShadow: `0 4px 24px 0 ${ACCENT}18` }}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-foreground">Attendance Overview</h2>
                                <Select value={overviewPeriod} onValueChange={setOverviewPeriod}>
                                    <SelectTrigger className="h-7 w-36 text-xs gap-1 border border-border rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Last Semester">Last Semester</SelectItem>
                                        <SelectItem value="This Year">This Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <AttendanceOverviewChart data={chartData} />
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" style={{ boxShadow: `0 4px 24px 0 ${ACCENT}18` }}>
                        {/* Table header bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
                            <h2 className="text-sm font-semibold text-foreground">Attendance</h2>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <Tabs value={activeTab} onValueChange={(v) => dispatch(setActiveTab(v as "students" | "teachers" | "staff"))}>
                                    <TabsList className="h-8 bg-muted p-0.5">
                                        <TabsTrigger
                                            value="students"
                                            className="h-7 px-3 text-xs data-[state=active]:text-white"
                                            style={activeTab === "students" ? { background: "#f472b6", color: "white" } : undefined}
                                        >
                                            Students
                                        </TabsTrigger>
                                        <TabsTrigger value="teachers" className="h-7 px-3 text-xs">
                                            Teachers
                                        </TabsTrigger>
                                        <TabsTrigger value="staff" className="h-7 px-3 text-xs">
                                            Staff
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="h-8 w-full sm:w-28 text-xs border border-border rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="h-8 w-full sm:w-28 text-xs border border-border rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mar 2035">Mar 2035</SelectItem>
                                        <SelectItem value="Feb 2035">Feb 2035</SelectItem>
                                        <SelectItem value="Jan 2035">Jan 2035</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="sticky left-0 bg-muted/40 text-left px-3 sm:px-5 py-3 font-medium text-muted-foreground text-xs w-[150px] sm:w-[200px]">
                                        {activeTab === "students" ? "Student" : activeTab === "teachers" ? "Teacher" : "Parent"}
                                    </th>
                                    {workdays.map((day) => (
                                        <th key={formatDateKey(day)} className="text-center px-2 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap min-w-[90px]">
                                            {formatDateLabel(day)}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-border">
                                            <td className="px-3 sm:px-5 py-3">
                                                <div className="h-4 w-32 sm:w-40 bg-muted animate-pulse rounded" />
                                            </td>
                                            {workdays.map((d) => (
                                                <td key={formatDateKey(d)} className="px-2 py-3 text-center">
                                                    <div className="h-5 w-5 bg-muted animate-pulse rounded-full mx-auto" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    pagedTabData.map((item) => (
                                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="sticky left-0 bg-background px-3 sm:px-5 py-3 font-medium text-foreground whitespace-nowrap">
                                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                                                    <span className="text-muted-foreground text-[10px] sm:text-xs">{item.id.slice(0, 8)}…</span>
                                                    <span className="text-xs sm:text-sm">{item.name}</span>
                                                </div>
                                            </td>
                                            {workdays.map((day) => {
                                                const dateKey = formatDateKey(day)
                                                const status = attendanceMap.get(`${item.id}__${dateKey}`)
                                                return (
                                                    <td key={dateKey} className="px-2 py-3 text-center">
                                                        <div className="flex justify-center">
                                                            <StatusIcon status={status} />
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Show</span>
                                <span className="border border-border rounded px-2 py-1 text-foreground font-medium">10</span>
                                <span>of {tabData.length} results</span>
                            </div>
                            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ArrowLeft className="size-3" />
                                </Button>
                                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        size="icon"
                                        className="size-7 text-xs"
                                        variant={page === i + 1 ? "default" : "outline"}
                                        style={page === i + 1 ? { background: ACCENT } : undefined}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ArrowRight className="size-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
