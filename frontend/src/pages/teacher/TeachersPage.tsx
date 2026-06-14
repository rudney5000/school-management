import React from 'react'
import {useParams} from "@tanstack/react-router";
import {
    Search,
    UserCheck,
    UserPlus,
    Users,
    UserX,
    MoreVertical,
    Filter
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Input
} from '@shared/ui'
import {
    type StatCardItem
} from '@shared/ui/data-table'
import {
    type Teacher,
    useTeachers
} from "@entities/teacher";
import {
    AddTeacherForm,
    EditTeacherForm,
    DeleteTeacherAlert,
    TeacherOverviewPanel
} from '@features/teacher'
import {
    cn,
    useTranslation,
    getInitials
} from "@shared/lib";

const TeachersPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [teacherToUpdate, setTeacherToUpdate] = React.useState<Teacher>()
    const [teacherToDelete, setTeacherToDelete] = React.useState<Teacher>()
    const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null)
    const [searchQuery, setSearchQuery] = React.useState('')
    const { t } = useTranslation()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/teachers',
    })

    const { data, isLoading, isError } = useTeachers(subSchoolId)

    const stats = React.useMemo<StatCardItem[]>(() => {
        const teachers = data ?? []
        const total = teachers.length
        const active = teachers.filter((s) => s.isActive).length
        const inactive = total - active
        const now = new Date()
        const newTeachers = teachers.filter((s) => {
            const enrolled = new Date(s.hireDate)
            return (
                enrolled.getMonth() === now.getMonth() &&
                enrolled.getFullYear() === now.getFullYear()
            )
        }).length

        const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

        return [
            {
                label: t('dashboard.teachers.stats.total'),
                value: total,
                icon: Users,
                trend: { value: `${total}`, positive: true },
            },
            {
                label: t('dashboard.teachers.stats.active'),
                value: active,
                icon: UserCheck,
                trend: { value: `${activePercent}%`, positive: true },
            },
            {
                label: t('dashboard.teachers.stats.inactive'),
                value: inactive,
                icon: UserX,
                trend: {
                    value: `${total > 0 ? Math.round((inactive / total) * 100) : 0}%`,
                    positive: false,
                },
            },
            {
                label: t('dashboard.teachers.stats.new'),
                value: newTeachers,
                icon: UserPlus,
                trend: { value: t('dashboard.teachers.stats.thisMonth'), positive: true },
            },
        ]
    }, [data, t])

    const filteredTeachers = React.useMemo(() => {
        if (!searchQuery) return data ?? []
        const query = searchQuery.toLowerCase()
        return (data ?? []).filter(
            (teacher) =>
                teacher.firstName.toLowerCase().includes(query) ||
                teacher.lastName.toLowerCase().includes(query) ||
                teacher.email.toLowerCase().includes(query) ||
                teacher.specialization?.toLowerCase().includes(query)
        )
    }, [data, searchQuery])

    const relatedTeachers = React.useMemo(() => {
        if (!selectedTeacher) return []
        return (data ?? [])
            .filter(
                (t) =>
                    t.id !== selectedTeacher.id &&
                    t.specialization === selectedTeacher.specialization
            )
            .slice(0, 5)
    }, [data, selectedTeacher])

    if (isLoading) return <div>{t('dashboard.teachers.loading')}</div>
    if (isError) return <div>{t('dashboard.teachers.error')}</div>

    return (
        <div className="flex h-screen bg-zinc-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-zinc-200 px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900">{t('dashboard.teachers.title')}</h1>
                            <p className="text-sm text-zinc-500 mt-1">{t('dashboard.teachers.subtitle')}</p>
                        </div>
                        <Button
                            onClick={() => setIsCreateOpen(!isCreateOpen)}
                            className="h-10 rounded-xl bg-[#1755EC] hover:bg-[#1755EC]/90 shadow-sm gap-2 px-5"
                        >
                            + {t('dashboard.teachers.add_teacher')}
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder={t('dashboard.teachers.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl border-zinc-200"
                            />
                        </div>
                        <Button variant="outline" className="h-10 rounded-xl gap-2">
                            <Filter className="h-4 w-4" />
                            Newest
                        </Button>
                    </div>
                </div>

                <div className="px-8 py-6">
                    <div className="grid grid-cols-4 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <div
                                    key={stat.label}
                                    className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#1755EC]/10 flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-[#1755EC]" />
                                        </div>
                                        {stat.trend && (
                                            <span
                                                className={cn(
                                                    'text-xs font-medium',
                                                    stat.trend.positive
                                                        ? 'text-emerald-600'
                                                        : 'text-rose-600'
                                                )}
                                            >
                                                {stat.trend.value}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                                    <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeachers.map((teacher) => {
                            const fullName = `${teacher.firstName} ${teacher.lastName}`
                            const image = teacher.image ?? `https://i.pravatar.cc/150?u=${teacher.id}`
                            const isSelected = selectedTeacher?.id === teacher.id

                            return (
                                <div
                                    key={teacher.id}
                                    onClick={() => setSelectedTeacher(teacher)}
                                    className={cn(
                                        'bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#1755EC]/30',
                                        isSelected ? 'border-[#1755EC] shadow-md' : 'border-zinc-200'
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
                                            <AvatarImage src={image} alt={fullName} />
                                            <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-sm font-semibold">
                                                {getInitials(fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span
                                            className={cn(
                                                'px-2.5 py-1 rounded-full text-xs font-medium',
                                                teacher.isActive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            )}
                                        >
                                            {teacher.isActive
                                                ? t('dashboard.teachers.status.active')
                                                : t('dashboard.teachers.status.inactive')
                                            }
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900 mb-1">{fullName}</h3>
                                    <p className="text-sm text-zinc-500 mb-3 truncate">{teacher.email}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600">
                                            {teacher.specialization || '—'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setTeacherToUpdate(teacher)
                                                }}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="w-[400px] bg-white border-l border-zinc-200 overflow-y-auto">
                <TeacherOverviewPanel
                    teacher={selectedTeacher}
                    onEdit={setTeacherToUpdate}
                    relatedTeachers={relatedTeachers}
                />
            </div>

            <AddTeacherForm
                isOpen={isCreateOpen}
                handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                handleSuccess={() => setIsCreateOpen(false)}
                submitButtonLabel={t('common.add')}
            />

            {teacherToUpdate && (
                <EditTeacherForm
                    teacher={teacherToUpdate}
                    isOpen={!!teacherToUpdate}
                    handleOpen={() => setTeacherToUpdate(undefined)}
                    handleSuccess={() => setTeacherToUpdate(undefined)}
                />
            )}

            {teacherToDelete && (
                <DeleteTeacherAlert
                    teacher={teacherToDelete}
                    isOpen={!!teacherToDelete}
                    onOpenChange={(open) => { if (!open) setTeacherToDelete(undefined) }}
                    handleSuccess={() => setTeacherToDelete(undefined)}
                />
            )}
        </div>
    )
}

export default TeachersPage