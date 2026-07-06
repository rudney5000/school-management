import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, useTranslation } from '@shared/lib'
import { Button } from '@shared/ui'
import type { Schedule } from '@entities/schedule'

type ScheduleCalendarProps<T extends Schedule = Schedule> = {
    currentDate: Date
    onMonthChange: (date: Date) => void
    onTodayClick: () => void
    schedules: T[]
    onScheduleClick?: (schedule: T) => void
}

const DAY_BG_COLORS = [
    'bg-[#E8F5F0]',
    'bg-[#EDE9FF]',
    'bg-[#FFF8E6]',
    'bg-[#FFE9EC]',
]

const DAY_TEXT_COLORS = [
    'text-emerald-600',
    'text-purple-600',
    'text-amber-600',
    'text-rose-600',
]

const DAY_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const

export const ScheduleCalendar = <T extends Schedule>({
                                                         currentDate,
                                                         onMonthChange,
                                                         onTodayClick,
                                                         schedules,
                                                         onScheduleClick,
                                                     }: ScheduleCalendarProps<T>) => {
    const { t } = useTranslation()

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDay = firstDay.getDay()
        const totalDays = lastDay.getDate()

        const days = []
        for (let i = 0; i < startDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }

    const getSchedulesForDay = (day: Date) => {
        const dayOfWeek = DAY_ORDER[day.getDay()]
        return schedules.filter((s) => s.dayOfWeek === dayOfWeek)
    }

    const getDayColorIndex = (dayOfWeek: string) => {
        return DAY_ORDER.indexOf(dayOfWeek as typeof DAY_ORDER[number]) % DAY_BG_COLORS.length
    }

    const isToday = (day: Date) => {
        const today = new Date()
        return day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear()
    }

    const days = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const today = new Date()

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTodayClick}
                        className="rounded-xl gap-2"
                    >
                        {t('dashboard.schedules.calendar.today')} {today.getDate()} ▼
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const newDate = new Date(currentDate)
                                newDate.setMonth(newDate.getMonth() - 1)
                                onMonthChange(newDate)
                            }}
                            className="h-8 w-8 rounded-lg"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold text-zinc-900 min-w-[150px] text-center">
                            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const newDate = new Date(currentDate)
                                newDate.setMonth(newDate.getMonth() + 1)
                                onMonthChange(newDate)
                            }}
                            className="h-8 w-8 rounded-lg"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-zinc-200 p-4 overflow-y-auto">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                        if (!day) {
                            return <div key={`empty-${index}`} className="aspect-square" />
                        }

                        const daySchedules = getSchedulesForDay(day)
                        const isCurrentDay = isToday(day)
                        const dayOfWeek = DAY_ORDER[day.getDay()]
                        const colorIndex = getDayColorIndex(dayOfWeek)
                        const hasSchedules = daySchedules.length > 0

                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => daySchedules[0] && onScheduleClick?.(daySchedules[0])}
                                className={cn(
                                    'aspect-square rounded-xl border-2 p-2 flex flex-col gap-1 transition-all hover:border-zinc-300 cursor-pointer',
                                    isCurrentDay
                                        ? 'border-[#1755EC] bg-[#1755EC] text-white'
                                        : hasSchedules
                                            ? cn('border-transparent', DAY_BG_COLORS[colorIndex])
                                            : 'border-zinc-100 bg-zinc-50'
                                )}
                            >
                                <span className={cn(
                                    'text-sm font-semibold',
                                    isCurrentDay ? 'text-white' : 'text-zinc-700'
                                )}>
                                    {day.getDate()}
                                </span>
                                {hasSchedules && (
                                    <span className={cn(
                                        'text-xs font-medium mt-auto',
                                        isCurrentDay ? 'text-white/80' : DAY_TEXT_COLORS[colorIndex]
                                    )}>
                                        {t('dashboard.schedules.task', { count: daySchedules.length })}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
