import {
    GraduationCap,
    Mail,
    Pencil,
    Phone,
    Eye,
    Users,
} from 'lucide-react'
import {
    useTranslation,
    getInitials
} from '@shared/lib'
import {
    EntityOverviewPanel,
    type OverviewQuickAction,
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@shared/ui";
import type {Teacher} from "@entities/teacher";

type TeacherOverviewPanelProps = {
    teacher: Teacher | null
    onView?: (teacher: Teacher) => void
    onEdit?: (teacher: Teacher) => void
    relatedTeachers?: Array<{ id: string; firstName: string; lastName: string; image?: string }>
}

export function TeacherOverviewPanel({ teacher, onView, onEdit, relatedTeachers }: TeacherOverviewPanelProps) {
    const { t } = useTranslation()

    const quickActions: OverviewQuickAction[] = [
        ...(onView ? [{ icon: Eye,    label: t('dashboard.common.actions.view'),  onClick: () => onView(teacher!) }] : []),
        ...(onEdit ? [{ icon: Pencil, label: t('dashboard.common.actions.edit'),  onClick: () => onEdit(teacher!) }] : []),
        { icon: Mail,  label: 'Email', href: `mailto:${teacher?.email}` },
        ...(teacher?.phone ? [{ icon: Phone, label: teacher.phone, href: `tel:${teacher.phone}`, colSpan: 3 }] : []),
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            <EntityOverviewPanel
                entity={teacher}
                badge={teacher ? {
                    label: teacher.isActive ? t('dashboard.teachers.status.active') : t('dashboard.teachers.status.inactive'),
                    variant: teacher.isActive ? 'success' : 'danger',
                } : undefined}
                details={teacher ? [
                    { label: t('dashboard.teachers.columns.email'),          value: teacher.email },
                    { label: t('dashboard.teachers.columns.phone'),          value: teacher.phone || '—' },
                    { label: t('dashboard.teachers.columns.gender'),         value: teacher.gender === 'male' ? t('dashboard.teachers.gender.male') : t('dashboard.teachers.gender.female') },
                    { label: t('dashboard.teachers.columns.dateOfBirth'),    value: new Date(teacher.dateOfBirth).toLocaleDateString('fr-FR') },
                    { label: t('dashboard.teachers.columns.hireDate'), value: new Date(teacher.hireDate).toLocaleDateString('fr-FR') },
                ] : []}
            quickActions={quickActions}
            emptyIcon={GraduationCap}
            emptyTitle={t('dashboard.teachers.overview.emptyTitle')}
            emptyDescription={t('dashboard.teachers.overview.emptyDescription')}
        />

            {relatedTeachers && relatedTeachers.length > 0 && (
                <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-[#1755EC]" />
                        <h4 className="text-sm font-semibold text-zinc-900">Teachers from the same subject</h4>
                    </div>
                    <div className="space-y-2">
                        {relatedTeachers.slice(0, 5).map((relatedTeacher) => {
                            const fullName = `${relatedTeacher.firstName} ${relatedTeacher.lastName}`
                            const image = relatedTeacher.image ?? `https://i.pravatar.cc/150?u=${relatedTeacher.id}`
                            return (
                                <div key={relatedTeacher.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={image} alt={fullName} />
                                        <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-xs font-medium">
                                            {getInitials(fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-zinc-700 font-medium">{fullName}</span>
                                </div>
                            )
                        })}
                        {relatedTeachers.length > 5 && (
                            <button className="text-sm text-[#1755EC] font-medium hover:underline">
                                +{relatedTeachers.length - 5} More
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
