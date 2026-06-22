import React from 'react'
import {
    useNavigate,
    useParams
} from '@tanstack/react-router'
import {
    Users,
    UserCheck,
    UserX
} from 'lucide-react'
import { Button } from '@shared/ui'
import {
    type StatCardItem
} from '@shared/ui/data-table'
import {
    type Parent,
    useParents
} from '@entities/parent'
import {
    AddParentForm,
    ParentOverviewPanel
} from '@features/parent'
import i18n from '@app/i18n/i18n'
import {useTranslation} from "@shared/lib";
import {getParentColumns} from "@/pages/parent/ui/ParentColumns";
import {ParentsTable} from "@/pages/parent/ui/ParentsTable";

const ParentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [parentToUpdate, setParentToUpdate] = React.useState<Parent>()
    const [parentToDelete, setParentToDelete] = React.useState<Parent>()

    const { t } = useTranslation()
    const navigate = useNavigate()
    const locale = i18n.language
    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/parents',
    })

    const { data, isLoading, isError } = useParents(subSchoolId)

    const stats = React.useMemo<StatCardItem[]>(() => {
        const parents = data ?? []
        const total = parents.length
        const active = parents.filter(p => p.isActive).length
        const inactive = total - active
        return [
            { label: t('dashboard.students.stats.total'), value: total, icon: Users,
                trend: { value: `${total}`, positive: true } },
            { label: t('dashboard.students.stats.active'), value: active, icon: UserCheck,
                trend: { value: `${total > 0 ? Math.round((active / total) * 100) : 0}%`, positive: true } },
            { label: t('dashboard.students.stats.inactive'), value: inactive, icon: UserX,
                trend: { value: `${total > 0 ? Math.round((inactive / total) * 100) : 0}%`, positive: false } },
        ]
    }, [data, t])

    const columns = React.useMemo(() => getParentColumns({
        t,
        parentToUpdate,
        parentToDelete,
        onEdit: setParentToUpdate,
        onDelete: setParentToDelete,
        onCancelEdit: () => setParentToUpdate(undefined),
        onCancelDelete: () => setParentToDelete(undefined),
    }), [t, parentToUpdate, parentToDelete])

    const handleViewParent = React.useCallback((parent: Parent) => {
        navigate({
            to: '/$locale/sub-schools/$subSchoolId/parents/$parentId',
            params: { locale, subSchoolId, parentId: parent.id },
        })
    }, [navigate, locale, subSchoolId])

    return (
        <ParentsTable
            columns={columns}
            data={data ?? []}
            isLoading={isLoading}
            isError={isError}
            searchPlaceholder={t('dashboard.parents.searchPlaceholder')}
            title={t('dashboard.parents.title')}
            subtitle={t('dashboard.parents.subtitle')}
            stats={stats}
            renderDetailPanel={(parent) => (
                <ParentOverviewPanel
                    parent={parent}
                    onView={handleViewParent}
                    onEdit={setParentToUpdate}
                />
            )}
        >
            <AddParentForm
                isOpen={isCreateOpen}
                handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                handleSuccess={() => setIsCreateOpen(false)}
                submitButtonLabel={t('common.add')}
            />
            <Button
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="h-10 rounded-2xl bg-[#1755EC] hover:bg-[#1755EC]/90 shadow-sm gap-2 px-5"
            >
                + {t('dashboard.parents.add_parent')}
            </Button>
        </ParentsTable>
    )
}

export default ParentsPage