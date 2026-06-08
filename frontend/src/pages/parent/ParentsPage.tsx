import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import { type Parent, useParents } from "@entities/parent"
import {
    AddParentForm,
    EditParentForm,
    DeleteParentAlert
} from '@features/parent'
import { ActionsComponent } from "@shared/ui/common/ActionsComponent"
import { useTranslation } from "@shared/lib"
import { useParams } from "@tanstack/react-router"

const ParentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [parentToUpdate, setParentToUpdate] = React.useState<Parent>()
    const [parentToDelete, setParentToDelete] = React.useState<Parent>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/parents',
    })
    const { data, isLoading, isError } = useParents(subSchoolId)
    const { t } = useTranslation()

    const columns: ColumnDef<Parent>[] = [
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
            accessorKey: 'firstName',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.parents.columns.firstName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                        {(row.getValue('firstName') as string)?.[0]}
                        {(row.getValue('lastName') as string)?.[0]}
                    </div>
                    {row.getValue('firstName')}
                </div>
            ),
        },
        {
            accessorKey: 'lastName',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.parents.columns.lastName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.getValue('lastName')}</div>,
        },
        {
            accessorKey: 'email',
            header: t('dashboard.parents.columns.email'),
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'phone',
            header: t('dashboard.parents.columns.phone'),
            cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
        },
        {
            accessorKey: 'createdAt',
            header: t('dashboard.parents.columns.createdAt'),
            cell: ({ row }) => {
                const date = row.getValue('createdAt') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
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
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">
                {t('dashboard.parents.title')}
            </h3>

            <DataTable columns={columns} data={data ?? []} searchKey="firstName">
                <AddParentForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel={t('common.add')}
                />
                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    {t('dashboard.parents.add_parent')}
                </Button>
            </DataTable>
        </div>
    )
}

export default ParentsPage