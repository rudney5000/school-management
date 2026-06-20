import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"
import { useTranslation } from "@shared/lib"

interface ChartData {
    month: string
    students: number
    teachers: number
    staff: number
}

interface AttendanceOverviewChartProps {
    data: ChartData[]
}

export function AttendanceOverviewChart({ data }: AttendanceOverviewChartProps) {
    const { t } = useTranslation()

    return (
        <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1755EC" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1755EC" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                    formatter={(value: any) => [`${Number(value) ?? 0}%`]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                />
                <Area type="monotone" dataKey="students" name={t('dashboard.attendance.table.tabs.students')} stroke="#f472b6" strokeWidth={2} fill="url(#colorStudents)" dot={false} />
                <Area type="monotone" dataKey="teachers" name={t('dashboard.attendance.table.tabs.teachers')} stroke="#22d3ee" strokeWidth={2} fill="url(#colorTeachers)" dot={false} />
                <Area type="monotone" dataKey="staff" name={t('dashboard.attendance.table.tabs.staff')} stroke="#1755EC" strokeWidth={2} fill="url(#colorStaff)" dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    )
}