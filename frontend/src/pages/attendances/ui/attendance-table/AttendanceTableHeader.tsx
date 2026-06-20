import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/shared/ui"
import type { Class } from "@entities/class"
import {useTranslation} from "@shared/lib";

interface AttendanceTableHeaderProps {
    activeTab: string
    onTabChange: (tab: "students" | "teachers" | "staff") => void
    classes: Class[]
    selectedClass: string
    setSelectedClass: (value: string) => void
    selectedMonth: string
    setSelectedMonth: (value: string) => void
    monthOptions: string[]
}

export function AttendanceTableHeader({
                                          activeTab,
                                          onTabChange,
                                          classes,
                                          selectedClass,
                                          setSelectedClass,
                                          selectedMonth,
                                          setSelectedMonth,
                                          monthOptions
}: AttendanceTableHeaderProps) {

    const { t } = useTranslation()

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard.attendance.title')}</h2>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "students" | "teachers" | "staff")}>
                    <TabsList className="h-8 bg-muted p-0.5">
                        <TabsTrigger
                            value="students"
                            className="h-7 px-3 text-xs data-[state=active]:text-white"
                            style={activeTab === "students" ? { background: "#f472b6", color: "white" } : undefined}
                        >
                            {t('dashboard.attendance.table.tabs.students')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="teachers"
                            className="h-7 px-3 text-xs"
                            style={activeTab === "teachers" ? { background: "#1755EC", color: "white" } : undefined}
                        >
                            {t('dashboard.attendance.table.tabs.teachers')}
                        </TabsTrigger>
                        <TabsTrigger value="staff" className="h-7 px-3 text-xs">
                            {t('dashboard.attendance.table.tabs.staff')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="h-8 w-full sm:w-28 text-xs border border-border rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-8 w-full sm:w-28 text-xs border border-border rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map((month) => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}