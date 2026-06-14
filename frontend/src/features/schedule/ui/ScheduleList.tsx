import React from 'react'
import {
    Star,
    Clock,
    MapPin,
    Pencil,
    Trash2
} from 'lucide-react'
import {
    cn,
    useTranslation,
    getInitials
} from '@shared/lib'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button
} from '@shared/ui'
import type { ScheduleWithRelations } from '@entities/schedule'

type ScheduleListProps = {
    schedules: ScheduleWithRelations[]
    onEdit?: (schedule: ScheduleWithRelations) => void
    onDelete?: (schedule: ScheduleWithRelations) => void
}

const COURSE_COLORS = [
    'bg-[#E8F5F0] text-emerald-700',
    'bg-[#EDE9FF] text-purple-700',
    'bg-[#FFF8E6] text-amber-700',
    'bg-[#FFE9EC] text-rose-700',
]

const DAY_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const

const getCourseColor = (courseId: string) => {
    const index = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COURSE_COLORS.length
    return COURSE_COLORS[index]
}

const getDayLabel = (dayOfWeek: string) => {
    const labels: Record<string, string> = {
        MONDAY: 'Lun',
        TUESDAY: 'Mar',
        WEDNESDAY: 'Mer',
        THURSDAY: 'Jeu',
        FRIDAY: 'Ven',
        SATURDAY: 'Sam',
        SUNDAY: 'Dim',
    }
    return labels[dayOfWeek] || dayOfWeek
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
    schedules,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation()

    const sortedSchedules = React.useMemo(() => {
        return [...schedules].sort((a, b) => {
            const dayOrderA = DAY_ORDER.indexOf(a.dayOfWeek)
            const dayOrderB = DAY_ORDER.indexOf(b.dayOfWeek)
            if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB
            return a.startTime.localeCompare(b.startTime)
        })
    }, [schedules])

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                {t('dashboard.schedules.list.title')}
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
                {new Date().toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})}
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {sortedSchedules.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                        {t('dashboard.schedules.list.empty')}
                    </div>
                ) : (
                    sortedSchedules.map((schedule) => {
                        const courseColor = getCourseColor(schedule.courseId)
                        const teacherName = `${schedule.teacher.firstName} ${schedule.teacher.lastName}`

                        return (
                            <div
                                key={schedule.id}
                                className={cn(
                                    'bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                                            courseColor
                                        )}>
                                            <Star className="h-4 w-4 fill-current"/>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900">
                                                {schedule.course.name}
                                            </h3>
                                            <p className="text-xs text-zinc-500">
                                                {schedule.class.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-zinc-400 hover:text-zinc-700"
                                                onClick={() => onEdit(schedule)}
                                            >
                                                <Pencil className="h-3.5 w-3.5"/>
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-zinc-400 hover:text-rose-600"
                                                onClick={() => onDelete(schedule)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5"/>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                        <Clock className="h-3.5 w-3.5"/>
                                        <span>{schedule.startTime} - {schedule.endTime}</span>
                                    </div>
                                    {schedule.room && (
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                            <MapPin className="h-3.5 w-3.5"/>
                                            <span>{schedule.room}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={`https://i.pravatar.cc/150?u=${schedule.teacher.id}`}
                                                alt={teacherName}
                                            />
                                            <AvatarFallback
                                                className="bg-[#1755EC]/10 text-[#1755EC] text-[10px] font-semibold">
                                                {getInitials(teacherName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-zinc-500">
                                                {getDayLabel(schedule.dayOfWeek)}
                                            </span>
                                    </div>
                                    <span className="text-xs font-medium text-zinc-400">
                                        {getDayLabel(schedule.dayOfWeek)}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
