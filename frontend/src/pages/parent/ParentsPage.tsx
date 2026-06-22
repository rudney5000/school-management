import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    ArrowUpDown,
    Mail,
    Phone,
    UserCheck,
    Users,
    UserX
} from 'lucide-react'
import {
    CustomDataTable,
    type StatCardItem
} from '@shared/ui/data-table'
import {
    type Parent,
    useParents
} from "@entities/parent"
import {
    AddParentForm,
    EditParentForm,
    DeleteParentAlert,
    ParentOverviewPanel
} from '@features/parent'
import { ActionsComponent } from "@shared/ui/common/ActionsComponent"
import {
    cn,
    useTranslation,
    getInitials
} from "@shared/lib"
import {useNavigate, useParams} from "@tanstack/react-router"
import i18n from "@app/i18n/i18n";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Checkbox
} from "@shared/ui";
import {SelectionCheckbox} from "@shared/ui/data-table/SelectionCheckbox";

const ParentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [parentToUpdate, setParentToUpdate] = React.useState<Parent>()
    const [parentToDelete, setParentToDelete] = React.useState<Parent>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const locale = i18n.language

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/parents',
    })
    const { data, isLoading, isError } = useParents(subSchoolId)

    const stats = React.useMemo<StatCardItem[]>(() => {
        const students = data ?? []
        const total = students.length
        const active = students.filter((s) => s.isActive).length
        const inactive = total - active
        const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

        return [
            {
                label: t('dashboard.students.stats.total'),
                value: total,
                icon: Users,
                trend: { value: `${total}`, positive: true },
            },
            {
                label: t('dashboard.students.stats.active'),
                value: active,
                icon: UserCheck,
                trend: { value: `${activePercent}%`, positive: true },
            },
            {
                label: t('dashboard.students.stats.inactive'),
                value: inactive,
                icon: UserX,
                trend: {
                    value: `${total > 0 ? Math.round((inactive / total) * 100) : 0}%`,
                    positive: false,
                },
            }
        ]
    }, [data, t])

    const handleViewParent = React.useCallback(
        (parent: Parent) => {
            navigate({
                to: '/$locale/sub-schools/$subSchoolId/parents/$parentId',
                params: {
                    locale,
                    subSchoolId,
                    parentId: parent.id,
                },
            })
        },
        [navigate, locale, subSchoolId]
    )

    const columns: ColumnDef<Parent>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Tout sélectionner"
                    className="border-zinc-300 data-checked:bg-[#1755EC] data-checked:border-[#1755EC]"
                />
            ),
            cell: ({ row }) => <SelectionCheckbox row={row} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'firstName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('dashboard.parents.columns.parent')}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => {
                const firstName = row.original.firstName
                const lastName = row.original.lastName
                const email = row.original.email
                const fullName = `${firstName} ${lastName}`
                const image =
                    row.original.image ?? `https://i.pravatar.cc/150?u=${row.original.id}`

                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={image} alt={fullName} />
                            <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-xs font-semibold">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                                {fullName}
                            </p>
                            <p className="text-xs text-zinc-400 truncate lowercase">{email}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {row.getValue('id')}
                </div>
            ),
        },
        {
            accessorKey: 'gender',
            header: t('dashboard.parents.columns.gender'),
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string
                return (
                    <span className="text-sm text-zinc-600">
                        {gender === 'male'
                            ? t('dashboard.parents.gender.male')
                            : t('dashboard.parents.gender.female')}
                    </span>
                )
            },
        },
        {
            id: 'contact',
            header: t('dashboard.parents.columns.contact'),
            enableSorting: false,
            cell: ({ row }) => {
                const email = row.original.email
                const phone = row.original.phone

                const copyToClipboard = (value: string) => {
                    navigator.clipboard.writeText(value)
                }

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                            title={email}
                            onClick={() => copyToClipboard(email)}
                        >
                            <Mail className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                            title={phone}
                            onClick={() => phone && copyToClipboard(phone)}
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
        {
            accessorKey: 'isActive',
            header: t('dashboard.parents.columns.status'),
            filterFn: (row, id, value) => {
                if (value === undefined || value === '') return true
                return row.getValue(id) === value
            },
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean
                return (
                    <Badge
                        className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium border-0',
                            isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                        )}
                    >
                        {isActive
                            ? t('dashboard.parents.status.active')
                            : t('dashboard.parents.status.inactive')}
                    </Badge>
                )
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <ActionsComponent<Parent>
                        row={row}
                        onEditAction={() => setParentToUpdate(row.original)}
                        onDeleteAction={() => setParentToDelete(row.original)}
                    />
                    <EditParentForm
                        parent={row.original}
                        isOpen={parentToUpdate?.id === row.original.id}
                        handleOpen={() => setParentToUpdate(undefined)}
                        handleSuccess={() => setParentToUpdate(undefined)}
                    />
                    <DeleteParentAlert
                        parent={row.original}
                        isOpen={parentToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) setParentToDelete(undefined) }}
                        handleSuccess={() => setParentToDelete(undefined)}
                    />
                </div>
            ),
        },
    ]

    if (isLoading) return <div>{t('dashboard.parents.loading')}</div>
    if (isError) return <div>{t('dashboard.parents.error')}</div>

    return (
        <CustomDataTable
            columns={columns}
            data={data ?? []}
            searchKey="firstName"
            searchPlaceholder={t('dashboard.parents.searchPlaceholder')}
            title={t('dashboard.parents.title')}
            subtitle={t('dashboard.parents.subtitle')}
            stats={stats}
            isLoading={isLoading}
            isError={isError}
            loadingMessage={t('dashboard.parents.loading')}
            errorMessage={t('dashboard.parents.error')}
            getRowId={(row) => row.id}
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
        </CustomDataTable>
    )
}

export default ParentsPage