import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DataTable } from '@shared/ui/data-table'
import { useStudents } from '@entities/student'
import { AddStudentForm, EditStudentForm, DeleteStudentAlert } from '@features/student'
import type { Student } from '@entities/student'
import {ActionsComponent} from "@shared/ui/common/ActionsComponent";
import {cn} from "@shared/lib";
import {useParams} from "@tanstack/react-router";

const StudentsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [studentToUpdate, setStudentToUpdate] = React.useState<Student>()
    const [studentToDelete, setStudentToDelete] = React.useState<Student>()

    const { subSchoolId } = useParams({
        from: '/$locale/dashboard/sub-schools/$subSchoolId/students',
    })
    const { data, isLoading, isError } = useStudents(subSchoolId)

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
                    PRÉNOM <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.getValue('firstName')}</div>,
        },
        {
            accessorKey: 'lastName',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    NOM <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.getValue('lastName')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'EMAIL',
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'phone',
            header: 'TÉLÉPHONE',
            cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
        },
        {
            accessorKey: 'gender',
            header: 'GENRE',
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string
                return <div>{gender === 'male' ? 'Homme' : 'Femme'}</div>
            },
        },
        {
            accessorKey: 'dateOfBirth',
            header: 'DATE DE NAISSANCE',
            cell: ({ row }) => {
                const date = row.getValue('dateOfBirth') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'enrollmentDate',
            header: 'INSCRIPTION',
            cell: ({ row }) => {
                const date = row.getValue('enrollmentDate') as string
                return <div>{new Date(date).toLocaleDateString('fr-FR')}</div>
            },
        },
        {
            accessorKey: 'isActive',
            header: 'STATUT',
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean
                return (
                    <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                    {isActive ? 'Actif' : 'Inactif'}
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
                        submitButtonLabel="Modifier"
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

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error</div>

    return (
        <div>
            <h3 className="text-2xl lg:text-4xl font-extrabold mb-2">Étudiants</h3>

            <DataTable columns={columns} data={data ?? []} searchKey="firstName">
                <AddStudentForm
                    isOpen={isCreateOpen}
                    handleOpen={() => setIsCreateOpen(!isCreateOpen)}
                    handleSuccess={() => setIsCreateOpen(false)}
                    submitButtonLabel="Ajouter"
                />
                <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
                    Ajouter un étudiant
                </Button>
            </DataTable>
        </div>
    )
}

export default StudentsPage