import {
    GraduationCap,
    Mail,
    Pencil,
    Phone,
    Eye,
    Users,
} from 'lucide-react'
import {type Student, useClassmates} from '@entities/student'
import { useTranslation } from '@shared/lib'
import {
    EntityOverviewPanel,
    type OverviewQuickAction,
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@shared/ui";
import { getInitials } from '@shared/lib/getInitial'


type StudentOverviewPanelProps = {
    student: Student | null
    onView?: (student: Student) => void
    onEdit?: (student: Student) => void
}

export function StudentOverviewPanel({ student, onView, onEdit }: StudentOverviewPanelProps) {
    const { t } = useTranslation()
    const { data: classmates } = useClassmates(student?.subSchoolId, student?.id)


    const quickActions: OverviewQuickAction[] = [
        ...(onView ? [{ icon: Eye,    label: t('dashboard.common.actions.view'),  onClick: () => onView(student!) }] : []),
        ...(onEdit ? [{ icon: Pencil, label: t('dashboard.common.actions.edit'),  onClick: () => onEdit(student!) }] : []),
        { icon: Mail,  label: 'Email', href: `mailto:${student?.email}` },
        ...(student?.phone ? [{ icon: Phone, label: student.phone, href: `tel:${student.phone}`, colSpan: 3 }] : []),
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            <EntityOverviewPanel
                entity={student}
                badge={student ? {
                    label: student.isActive ? t('dashboard.students.status.active') : t('dashboard.students.status.inactive'),
                    variant: student.isActive ? 'success' : 'danger',
                } : undefined}
                details={student ? [
                    { label: t('dashboard.students.columns.email'),          value: student.email },
                    { label: t('dashboard.students.columns.phone'),          value: student.phone || '—' },
                    { label: t('dashboard.students.columns.gender'),         value: student.gender === 'male' ? t('dashboard.students.gender.male') : t('dashboard.students.gender.female') },
                    { label: t('dashboard.students.columns.dateOfBirth'),    value: new Date(student.dateOfBirth).toLocaleDateString('fr-FR') },
                    { label: t('dashboard.students.columns.enrollmentDate'), value: new Date(student.enrollmentDate).toLocaleDateString('fr-FR') },
                ] : []}
                academicStats={{
                    completionPercent: 78,
                    completionLabel: t('dashboard.students.overview.academicProgress'),
                    attendancePercent: 92,
                    attendanceLabel: t('dashboard.students.overview.attendance'),
                    attendancePeriodLabel: t('dashboard.students.overview.thisMonth'),
                }}
                quickActions={quickActions}
                emptyIcon={GraduationCap}
                emptyTitle={t('dashboard.students.overview.emptyTitle')}
                emptyDescription={t('dashboard.students.overview.emptyDescription')}
            />

            {classmates && classmates.length > 0 && (
                <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-[#1755EC]" />
                        <h4 className="text-sm font-semibold text-zinc-900">Camardes de classe</h4>
                    </div>
                    <div className="space-y-2">
                        {classmates.map((classmate) => {
                            const fullName = `${classmate.firstName} ${classmate.lastName}`
                            const image = classmate.image ?? `https://i.pravatar.cc/150?u=${classmate.id}`
                            return (
                                <div key={classmate.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
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
                    </div>
                </div>
            )}
        </div>
    )
}
