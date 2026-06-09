import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import { type Class, useClasses } from "@entities/class"
import { AddClassForm, EditClassForm, DeleteClassAlert } from '@features/class'
import { ActionsComponent } from "@shared/ui/common/ActionsComponent"
import { useTranslation } from "@shared/lib"
import { useParams } from "@tanstack/react-router"

const ClassesPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [classToUpdate, setClassToUpdate] = React.useState<Class>()
    const [classToDelete, setClassToDelete] = React.useState<Class>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/classes',
    })
    const { data, isLoading, isError } = useClasses(subSchoolId)
    const { t } = useTranslation()

    const columns: ColumnDef<Class>[] = [
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
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.classes.columns.name')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                        {(row.getValue('name') as string)?.[0]}
                    </div>
                    {row.getValue('name')}
                </div>
            ),
        },
        {
            accessorKey: 'gradeLevel',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.classes.columns.gradeLevel')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('gradeLevel') || '—'}</div>,
        },
        {
            accessorKey: 'capacity',
            header: t('dashboard.classes.columns.capacity'),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {row.getValue('capacity')}
                </div>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <ActionsComponent<Class>
                        row={row}
                        onEditAction={() => setClassToUpdate(row.original)}
                        onDeleteAction={() => setClassToDelete(row.original)}
                    />
                    <EditClassForm
                        classItem={row.original}
                        isOpen={classToUpdate?.id === row.original.id}
                        handleOpen={() => setClassToUpdate(undefined)}
                        handleSuccess={() => setClassToUpdate(undefined)}
                    />
                    <DeleteClassAlert
                        classItem={row.original}
                        isOpen={classToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) setClassToDelete(undefined) }}
                        handleSuccess={() => setClassToDelete(undefined)}
                    />
                </div>
            ),
        },
    ]

    if (isLoading) return <div>{t('dashboard.classes.loading')}</div>
    if (isError) return <div>{t('dashboard.classes.error')}</div>

    return (
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">
                {t('dashboard.classes.title')}
            </h3>

            <DataTable columns={columns} data={data ?? []} searchKey="name">
                <AddClassForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel={t('common.add')}
                />
                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    {t('dashboard.classes.add_class')}
                </Button>
            </DataTable>
        </div>
    )
}

export default ClassesPage