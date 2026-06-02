import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ScheduleBadge } from './ScheduleBadge'

const todaySchedule = [
    {
        time: '08:00 AM',
        course: 'CS201 — Data Structures',
        room: 'Period 1 · Rm 204 · 28 students',
        status: 'done',
    },
    {
        time: '09:30 AM',
        course: 'CS102 — Web Development',
        room: 'Period 2 · Rm 204 · 30 students',
        status: 'done',
    },
    {
        time: '11:00 AM',
        course: 'CS101 — Intro to Algorithms',
        room: 'Period 3 · Rm 204 · 29 students · Currently active',
        status: 'live',
    },
    {
        time: '12:30 PM',
        course: 'Lunch Break',
        room: '45 min · Staff room',
        status: 'next',
    },
    {
        time: '01:30 PM',
        course: 'Office Hours / Tutoring',
        room: 'Period 4 · Rm 204 · Walk-in',
        status: 'upcoming',
    },
    {
        time: '03:00 PM',
        course: 'Dept. Staff Meeting',
        room: 'CS Faculty · Conference Rm B',
        status: 'upcoming',
    },
]

export function ScheduleWidget() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            Today's Schedule
                        </CardTitle>

                        <p className="text-xs text-zinc-400 mt-0.5">
                            Wednesday, April 8 · 5 periods
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1"
                    >
                        <Plus className="h-3 w-3" />
                        New Event
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                {todaySchedule.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                            item.status === 'live'
                                ? 'bg-indigo-50 ring-1 ring-indigo-200'
                                : 'hover:bg-zinc-50'
                        )}
                    >
                        <div className="w-16 text-xs font-mono text-zinc-400 shrink-0">
                            {item.time}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div
                                className={cn(
                                    'text-sm font-semibold truncate',
                                    item.status === 'live'
                                        ? 'text-indigo-700'
                                        : 'text-zinc-800'
                                )}
                            >
                                {item.course}
                            </div>

                            <div className="text-xs text-zinc-400 truncate">
                                {item.room}
                            </div>
                        </div>

                        <ScheduleBadge status={item.status} />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}