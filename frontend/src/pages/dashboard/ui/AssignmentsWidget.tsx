import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card'

import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const assignments = [
    {
        color: 'bg-indigo-400',
        title: 'CSS Grid Portfolio Page',
        sub: 'CS102 · Web Dev · 30 students',
        date: 'Apr 10',
        note: '15/30 early',
    },
    {
        color: 'bg-teal-400',
        title: 'Binary Tree Implementation',
        sub: 'CS201 · Data Structures · 28 students',
        date: 'Apr 12',
        note: '5/28 submitted',
    },
    {
        color: 'bg-zinc-300',
        title: 'Midterm Study Guide',
        sub: 'All Classes · Optional prep',
        date: 'Apr 15',
        note: 'Optional',
    },
    {
        color: 'bg-red-400',
        title: 'Unit 3 Quiz — Variables',
        sub: 'CS101 · Auto-graded · 29 students',
        date: 'Overdue',
        note: '6 missing',
        overdue: true,
    },
]

export function AssignmentsWidget() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            Assignments
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            This week · Pending & due
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1"
                    >
                        <Plus className="h-3 w-3" />
                        New
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {assignments.map((assignment, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <div
                            className={cn(
                                'w-8 h-8 rounded-lg shrink-0',
                                assignment.color
                            )}
                        />

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                                {assignment.title}
                            </div>

                            <div className="text-xs text-zinc-400 truncate">
                                {assignment.sub}
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <div
                                className={cn(
                                    'text-xs font-semibold',
                                    assignment.overdue
                                        ? 'text-red-500'
                                        : 'text-zinc-600'
                                )}
                            >
                                {assignment.date}
                            </div>

                            <div
                                className={cn(
                                    'text-[10px]',
                                    assignment.overdue
                                        ? 'text-red-400'
                                        : 'text-zinc-400'
                                )}
                            >
                                {assignment.note}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}