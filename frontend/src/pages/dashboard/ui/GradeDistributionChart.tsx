import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card'

import { cn } from '@/shared/lib/utils'

const gradeDistribution = [
    { grade: 'A', students: 28, color: '#6366f1' },
    { grade: 'B', students: 22, color: '#10b981' },
    { grade: 'C', students: 16, color: '#f59e0b' },
    { grade: 'D', students: 10, color: '#f97316' },
    { grade: 'F', students: 6, color: '#ef4444' },
]

export function GradeDistributionChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            Grade Distribution
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            All classes · Q2 2026
                        </p>
                    </div>

                    <div className="flex gap-1.5">
                        {['All Classes', 'CS101', 'CS102', 'CS201'].map(
                            (course, index) => (
                                <button
                                    key={course}
                                    className={cn(
                                        'text-xs px-2.5 py-1 rounded-full transition-colors',
                                        index === 0
                                            ? 'bg-zinc-800 text-white'
                                            : 'text-zinc-500 hover:bg-zinc-100'
                                    )}
                                >
                                    {course}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                        data={gradeDistribution}
                        barSize={48}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />

                        <XAxis
                            dataKey="grade"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: '#94a3b8',
                            }}
                        />

                        <YAxis hide />

                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow:
                                    '0 4px 12px rgba(0,0,0,.1)',
                                fontSize: 12,
                            }}
                            formatter={(value) => [
                                `${value} students`,
                            ]}
                        />

                        <Bar
                            dataKey="students"
                            radius={[4, 4, 0, 0]}
                        >
                            {gradeDistribution.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-5 text-center mt-2 pt-3 border-t border-zinc-100 text-xs">
                    {gradeDistribution.map((grade) => (
                        <div key={grade.grade}>
                            <div className="font-bold text-zinc-800">
                                {grade.students}
                            </div>
                            <div className="text-zinc-400">
                                students
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-5 gap-3 mt-4 pt-4 border-t border-zinc-100">
                    {[
                        {
                            val: '82.4%',
                            lbl: 'Class Average',
                            color: 'text-zinc-800',
                        },
                        {
                            val: '82/87',
                            lbl: 'Passing',
                            color: 'text-zinc-800',
                        },
                        {
                            val: '6',
                            lbl: 'Failing',
                            color: 'text-red-500',
                        },
                        {
                            val: '28',
                            lbl: 'A-Grade Students',
                            color: 'text-indigo-600',
                        },
                        {
                            val: '94.7%',
                            lbl: 'Submission Rate',
                            color: 'text-zinc-800',
                        },
                    ].map((item) => (
                        <div
                            key={item.lbl}
                            className="text-center"
                        >
                            <div
                                className={cn(
                                    'text-base font-bold',
                                    item.color
                                )}
                            >
                                {item.val}
                            </div>

                            <div className="text-[10px] text-zinc-400 leading-tight">
                                {item.lbl}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}