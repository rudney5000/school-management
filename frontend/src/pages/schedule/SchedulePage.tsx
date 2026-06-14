import React from 'react'
import { useParams } from '@tanstack/react-router'
import { Button } from '@shared/ui'
import { useTranslation } from '@shared/lib'
import {
    useSchedules,
    type ScheduleWithRelations
} from '@entities/schedule'
import {
    AddScheduleForm,
    EditScheduleForm,
    DeleteScheduleAlert,
    ScheduleList,
    ScheduleCalendar
} from '@features/schedule'

const SchedulePage = () => {
    const { t } = useTranslation()
    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/schedules',
    })

    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [scheduleToEdit, setScheduleToEdit] = React.useState<ScheduleWithRelations>()
    const [scheduleToDelete, setScheduleToDelete] = React.useState<ScheduleWithRelations>()

    const { data: schedules, isLoading, isError } = useSchedules(subSchoolId)

    const handleMonthChange = (date: Date) => {
        setCurrentDate(date)
    }

    const handleTodayClick = () => {
        setCurrentDate(new Date())
    }

    const handleScheduleClick = (schedule: ScheduleWithRelations) => {
        setScheduleToEdit(schedule)
    }

    const handleEdit = (schedule: ScheduleWithRelations) => {
        setScheduleToEdit(schedule)
    }

    const handleDelete = (schedule: ScheduleWithRelations) => {
        setScheduleToDelete(schedule)
    }

    if (isLoading) return <div className="p-8">{t('dashboard.schedules.loading')}</div>
    if (isError) return <div className="p-8">{t('dashboard.schedules.error')}</div>

    const schedulesWithRelations: ScheduleWithRelations[] = (schedules ?? []).map((s) => ({
        ...s,
        class: { id: s.classId, name: `Class ${s.classId.slice(0, 4)}` },
        course: { id: s.courseId, name: `Course ${s.courseId.slice(0, 4)}` },
        teacher: { id: s.teacherId, firstName: 'John', lastName: 'Doe' },
    }))

    return (
        <div className="flex h-screen bg-zinc-50">
            <div className="w-[280px] bg-white border-r border-zinc-200 flex flex-col">
                <ScheduleList
                    schedules={schedulesWithRelations}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">{t('dashboard.schedules.title')}</h1>
                        <p className="text-sm text-zinc-500 mt-1">{t('dashboard.schedules.subtitle')}</p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-10 rounded-xl bg-[#1755EC] hover:bg-[#1755EC]/90 shadow-sm gap-2 px-5"
                    >
                        {t('dashboard.schedules.changeRoutine')}
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ScheduleCalendar
                        currentDate={currentDate}
                        onMonthChange={handleMonthChange}
                        onTodayClick={handleTodayClick}
                        schedules={schedulesWithRelations ?? []}
                        onScheduleClick={handleScheduleClick}
                    />
                </div>
            </div>

            <AddScheduleForm
                isOpen={isAddOpen}
                handleOpen={() => setIsAddOpen(!isAddOpen)}
                handleSuccess={() => setIsAddOpen(false)}
                submitButtonLabel={t('dashboard.common.confirm')}
            />

            {scheduleToEdit && (
                <EditScheduleForm
                    schedule={scheduleToEdit}
                    isOpen={!!scheduleToEdit}
                    handleOpen={() => setScheduleToEdit(undefined)}
                    handleSuccess={() => setScheduleToEdit(undefined)}
                />
            )}

            {scheduleToDelete && (
                <DeleteScheduleAlert
                    schedule={scheduleToDelete}
                    isOpen={!!scheduleToDelete}
                    onOpenChange={(open) => {
                        if (!open) setScheduleToDelete(undefined)
                    }}
                    handleSuccess={() => setScheduleToDelete(undefined)}
                />
            )}
        </div>
    )
}

export default SchedulePage
