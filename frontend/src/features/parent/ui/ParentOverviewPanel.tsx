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
import type { Parent } from "@entities/parent";

type ParentOverviewPanelProps = {
    parent: Parent | null
    onView?: (parent: Parent) => void
    onEdit?: (parent: Parent) => void
}

export function ParentOverviewPanel({ parent, onView, onEdit }: ParentOverviewPanelProps) {
    const { t } = useTranslation()

    const quickActions: OverviewQuickAction[] = [
        ...(onView ? [{ icon: Eye,    label: t('dashboard.common.actions.view'),  onClick: () => onView(parent!) }] : []),
        ...(onEdit ? [{ icon: Pencil, label: t('dashboard.common.actions.edit'),  onClick: () => onEdit(parent!) }] : []),
        { icon: Mail,  label: 'Email', href: `mailto:${parent?.email}` },
        ...(parent?.phone ? [{ icon: Phone, label: parent.phone, href: `tel:${parent.phone}`, colSpan: 3 }] : []),
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            <EntityOverviewPanel
                entity={parent}
                details={parent ? [
                    { label: t('dashboard.parents.columns.email'),          value: parent.email },
                    { label: t('dashboard.parents.columns.phone'),          value: parent.phone || '—' },
                    { label: t('dashboard.parents.columns.gender'),         value: parent.gender === 'male' ? t('dashboard.teachers.gender.male') : t('dashboard.teachers.gender.female') },
                    { label: t('dashboard.parents.columns.dateOfBirth'),    value: new Date(parent.dateOfBirth).toLocaleDateString('fr-FR') },
                ] : []}
                quickActions={quickActions}
                emptyIcon={GraduationCap}
                emptyTitle={t('dashboard.parents.overview.emptyTitle')}
                emptyDescription={t('dashboard.parents.overview.emptyDescription')}
            />

            {parent?.children && parent.children.length > 0 && (
                <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-[#1755EC]" />
                        <h4 className="text-sm font-semibold text-zinc-900">
                            {t('dashboard.parents.overview.children')}
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {parent.children.map((child) => {
                            const fullName = `${child.firstName} ${child.lastName}`
                            return (
                                <div key={child.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={`https://i.pravatar.cc/150?u=${child.id}`}
                                            alt={fullName}
                                        />
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