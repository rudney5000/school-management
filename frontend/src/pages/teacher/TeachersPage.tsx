import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import {type Teacher, useTeachers} from "@entities/teacher";
import { AddTeacherForm, EditTeacherForm, DeleteTeacherAlert } from '@features/teacher'
import {ActionsComponent} from "@shared/ui/common/ActionsComponent";
import {cn, useTranslation} from "@shared/lib";
import {useParams} from "@tanstack/react-router";

const TeachersPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [teacherToUpdate, setTeacherToUpdate] = React.useState<Teacher>()
    const [teacherToDelete, setTeacherToDelete] = React.useState<Teacher>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/teachers',
    })
    const { data, isLoading, isError } = useTeachers(subSchoolId)

    const { t } = useTranslation()

    const columns: ColumnDef<Teacher>[] = [
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
                    {t('dashboard.teachers.columns.firstName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
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
                    {t('dashboard.teachers.columns.lastName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.getValue('lastName')}</div>,
        },
        {
            accessorKey: 'email',
            header: t('dashboard.teachers.columns.email'),
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'phone',
            header: t('dashboard.teachers.columns.phone'),
            cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
        },
        {
            accessorKey: 'gender',
            header: t('dashboard.teachers.columns.gender'),
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string
                return (
                    <div>
                        {gender === 'male'
                            ? t('dashboard.teachers.gender.male')
                            : t('dashboard.teachers.gender.female')
                        }
                    </div>
                )
            },
        },
        {
            accessorKey: 'dateOfBirth',
            header: t('dashboard.teachers.columns.dateOfBirth'),
            cell: ({ row }) => {
                const date = row.getValue('dateOfBirth') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'hireDate',
            header: t('dashboard.teachers.columns.hireDate'),
            cell: ({ row }) => {
                const date = row.getValue('hireDate') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'specialization',
            header: t('dashboard.teachers.columns.specialization'),
            cell: ({ row }) => <div>{row.getValue('specialization') || '—'}</div>,
        },
        {
            accessorKey: 'isActive',
            header: t('dashboard.teachers.columns.status'),
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean
                return (
                    <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    )}>
                        {isActive
                            ? t('dashboard.teachers.status.active')
                            : t('dashboard.teachers.status.inactive')
                        }
                    </span>
                )
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <ActionsComponent<Teacher>
                        row={row}
                        onEditAction={() => setTeacherToUpdate(row.original)}
                        onDeleteAction={() => setTeacherToDelete(row.original)}
                    />
                    <EditTeacherForm
                        teacher={row.original}
                        isOpen={teacherToUpdate?.id === row.original.id}
                        handleOpen={() => setTeacherToUpdate(undefined)}
                        handleSuccess={() => setTeacherToUpdate(undefined)}
                    />
                    <DeleteTeacherAlert
                        teacher={row.original}
                        isOpen={teacherToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) setTeacherToDelete(undefined) }}
                        handleSuccess={() => setTeacherToDelete(undefined)}
                    />
                </div>
            ),
        },
    ]

    if (isLoading) return <div>{t('dashboard.teachers.loading')}</div>
    if (isError) return <div>{t('dashboard.teachers.error')}</div>

    return (
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">
                {t('dashboard.teachers.title')}
            </h3>

            <DataTable columns={columns} data={data ?? []} searchKey="firstName">
                <AddTeacherForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel={t('common.add')}
                />
                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    {t('dashboard.teachers.add_teacher')}
                </Button>
            </DataTable>
        </div>
    )
}

export default TeachersPage