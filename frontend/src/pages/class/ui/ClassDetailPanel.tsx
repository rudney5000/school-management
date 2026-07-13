import type {Class} from "@entities/class";
import {
    EntityOverviewPanel,
    type OverviewBadge,
    type OverviewDetailItem,
    type OverviewQuickAction
} from "@shared/ui/data-table/panels/EntityOverviewPanel";
import {
    Edit,
    Eye
} from "lucide-react";

export const ClassDetailPanel = ({ classItem }: { classItem: Class }) => {

    const badge: OverviewBadge | undefined = classItem.isActive !== undefined ? {
        label: classItem.isActive ? 'Actif' : 'Inactif',
        variant: classItem.isActive ? 'success' : 'neutral'
    } : undefined

    const details: OverviewDetailItem[] = [
        { label: 'Niveau', value: classItem.gradeLevel || '-' },
        { label: 'Capacité', value: classItem.capacity.toString() },
        { label: 'Effectif', value: classItem.studentsCount?.toString() || '0' },
        { label: 'Enseignant', value: Array.isArray(classItem.teacher) ? classItem.teacher.join(', ') : (classItem.teacher || '-') },
    ]

    const quickActions: OverviewQuickAction[] = [
        { icon: Edit, label: 'Modifier', onClick: () => {} },
        { icon: Eye, label: 'Voir détails', onClick: () => {} },
    ]

    return (
        <EntityOverviewPanel
            entity={{
                id: classItem.id,
                firstName: classItem.name,
                lastName: '',
                image: null
            }}
            badge={badge}
            details={details}
            quickActions={quickActions}
        />
    )
}