import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import { type Course, useCourses } from "@entities/courses"
import {
    AddCourseForm,
    EditCourseForm,
    DeleteCourseAlert
} from '@features/courses'
import { ActionsComponent } from "@shared/ui/common/ActionsComponent"
import { useTranslation } from "@shared/lib"
import { useParams } from "@tanstack/react-router"

const CoursesPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [classToUpdate, setClassToUpdate] = React.useState<Course>()
    const [classToDelete, setClassToDelete] = React.useState<Course>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/courses',
    })
    const { data, isLoading, isError } = useCourses(subSchoolId)
    const { t } = useTranslation()

    const columns: ColumnDef<Course>[] = [
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
                    {t('dashboard.courses.columns.name')} <ArrowUpDown className="ml-2 h-4 w-4" />
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
            accessorKey: 'code',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.courses.columns.code')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('code') || '—'}</div>,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.courses.columns.description')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('description') || '—'}</div>,
        },
        {
            accessorKey: 'credits',
            header: t('dashboard.courses.columns.credits'),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {row.getValue('credits')}
                </div>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <ActionsComponent<Course>
                        row={row}
                        onEditAction={() => setClassToUpdate(row.original)}
                        onDeleteAction={() => setClassToDelete(row.original)}
                    />
                    <EditCourseForm
                        course={row.original}
                        isOpen={classToUpdate?.id === row.original.id}
                        handleOpen={() => setClassToUpdate(undefined)}
                        handleSuccess={() => setClassToUpdate(undefined)}
                    />
                    <DeleteCourseAlert
                        course={row.original}
                        isOpen={classToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) setClassToDelete(undefined) }}
                        handleSuccess={() => setClassToDelete(undefined)}
                    />
                </div>
            ),
        },
    ]

    if (isLoading) return <div>{t('dashboard.course.loading')}</div>
    if (isError) return <div>{t('dashboard.courses.error')}</div>

    return (
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">
                {t('dashboard.courses.title')}
            </h3>

            <DataTable columns={columns} data={data ?? []} searchKey="name">
                <AddCourseForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel={t('dashboard.common.confirm')}
                />
                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    {t('dashboard.courses.add_course')}
                </Button>
            </DataTable>
        </div>
    )
}

export default CoursesPage