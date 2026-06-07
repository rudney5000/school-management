import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import { useStudents } from '@entities/student'
import { AddStudentForm, EditStudentForm, DeleteStudentAlert } from '@features/student'
import type { Student } from '@entities/student'
import {ActionsComponent} from "@shared/ui/common/ActionsComponent";
import {cn, useTranslation} from "@shared/lib";
import {useParams} from "@tanstack/react-router";

const StudentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [studentToUpdate, setStudentToUpdate] = React.useState<Student>()
    const [studentToDelete, setStudentToDelete] = React.useState<Student>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/students',
    })
    const { data, isLoading, isError } = useStudents(subSchoolId)

    const { t } = useTranslation()

    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div className="text-xs text-muted-foreground truncate max-w-[80px]">{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'firstName',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.students.columns.firstName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                        {(row.getValue('firstName') as string)?.[0]}{(row.getValue('lastName') as string)?.[0]}
                    </div>
                    {row.getValue('firstName')}
                </div>
            )
        },
        {
            accessorKey: 'lastName',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.students.columns.lastName')} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.getValue('lastName')}</div>,
        },
        {
            accessorKey: 'email',
            header: t('dashboard.students.columns.email'),
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'phone',
            header: t('dashboard.students.columns.phone'),
            cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
        },
        {
            accessorKey: 'gender',
            header: t('dashboard.students.columns.gender'),
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string
                return <div>{gender === 'male' ? t('dashboard.students.gender.male') : t('dashboard.students.gender.female')}</div>
            },
        },
        {
            accessorKey: 'image',
            header: t('dashboard.students.columns.image'),
            cell: ({ row }) => {
                const firstName = row.getValue('firstName') as string
                const lastName = row.getValue('lastName') as string
                const image = row.original.image ?? `https://i.pravatar.cc/150?u=${row.original.id}`

                return (
                    <div className="flex items-center gap-2">
                        <img
                            src={image}
                            alt={`${firstName} ${lastName}`}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                        {firstName}
                    </div>
                )
            }
        },
        {
            accessorKey: 'dateOfBirth',
            header: t('dashboard.students.columns.dateOfBirth'),
            cell: ({ row }) => {
                const date = row.getValue('dateOfBirth') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'enrollmentDate',
            header: t('dashboard.students.columns.enrollmentDate'),
            cell: ({ row }) => {
                const date = row.getValue('enrollmentDate') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'isActive',
            header: t('dashboard.students.columns.status'),
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean
                return (
                    <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                    {isActive ? t('dashboard.students.status.active') : t('dashboard.students.status.inactive')}
                </span>
                )
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <ActionsComponent<Student>
                        row={row}
                        onEditAction={() => setStudentToUpdate(row.original)}
                        onDeleteAction={() => setStudentToDelete(row.original)}
                    />
                    <EditStudentForm
                        student={row.original}
                        isOpen={studentToUpdate?.id === row.original.id}
                        handleOpen={() => setStudentToUpdate(undefined)}
                        handleSuccess={() => setStudentToUpdate(undefined)}
                    />
                    <DeleteStudentAlert
                        student={row.original}
                        isOpen={studentToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) setStudentToDelete(undefined) }}
                        handleSuccess={() => setStudentToDelete(undefined)}
                    />
                </div>
            ),
        },
    ]

    if (isLoading) return <div>{t('dashboard.students.loading')}</div>
    if (isError) return <div>{t('dashboard.students.error')}</div>

    return (
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">
                {t('dashboard.students.title')}
            </h3>

            <DataTable columns={columns} data={data ?? []} searchKey="firstName">
                <AddStudentForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel={t('dashboard.students.add')}
                />

                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    {t('dashboard.students.add_student')}
                </Button>
            </DataTable>
        </div>
    )
}

export default StudentsPage