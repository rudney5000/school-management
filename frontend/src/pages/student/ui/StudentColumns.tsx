import type { ColumnDef } from '@tanstack/react-table'
import {
    ArrowUpDown,
    Mail,
    Phone
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Checkbox
} from '@shared/ui'
import { SelectionCheckbox } from '@shared/ui/data-table'
import { ActionsComponent } from '@shared/ui/common/ActionsComponent'
import {cn, getInitials} from '@shared/lib'
import type {TFunction} from "i18next";
import type {Student} from "@entities/student";
import {
    DeleteStudentAlert,
    EditStudentForm
} from "@features/student";

interface StudentColumnsOptions {
    t: TFunction
    studentToUpdate: Student | undefined
    studentToDelete: Student | undefined
    onEdit: (student: Student) => void
    onDelete: (student: Student) => void
    onView: (student: Student) => void
    onCancelEdit: () => void
    onCancelDelete: () => void
}

export function getStudentColumns({
                                     t,
                                     studentToUpdate,
                                     studentToDelete,
                                     onEdit,
                                     onDelete,
                                     onCancelEdit,
                                     onCancelDelete,
                                     onView
}: StudentColumnsOptions): ColumnDef<Student>[] {

    return [
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
                    {t('dashboard.students.columns.student')}
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
                <span className="text-xs font-mono text-zinc-400">
                    {String(row.getValue('id')).slice(0, 8)}…
                </span>
            ),
        },
        {
            accessorKey: 'gender',
            header: t('dashboard.students.columns.gender'),
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string
                return (
                    <span className="text-sm text-zinc-600">
                        {gender === 'male'
                            ? t('dashboard.students.gender.male')
                            : t('dashboard.students.gender.female')}
                    </span>
                )
            },
        },
        {
            accessorKey: 'enrollmentDate',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('dashboard.students.columns.enrollmentDate')}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = row.getValue('enrollmentDate') as string
                return (
                    <span className="text-sm text-zinc-600">
                        {new Date(date).toLocaleDateString('fr-FR')}
                    </span>
                )
            },
        },
        {
            id: 'contact',
            header: t('dashboard.students.columns.contact'),
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
            header: t('dashboard.students.columns.status'),
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
                            ? t('dashboard.students.status.active')
                            : t('dashboard.students.status.inactive')}
                    </Badge>
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
                        onEditAction={() => onEdit(row.original)}
                        onDeleteAction={() => onDelete(row.original)}
                        onViewAction={() => onView(row.original)}
                    />
                    <EditStudentForm
                        student={row.original}
                        isOpen={studentToUpdate?.id === row.original.id}
                        handleOpen={onCancelEdit}
                        handleSuccess={onCancelEdit}
                    />
                    <DeleteStudentAlert
                        student={row.original}
                        isOpen={studentToDelete?.id === row.original.id}
                        onOpenChange={(open) => {
                            if (!open) onCancelDelete()
                        }}
                        handleSuccess={onCancelDelete}
                    />
                </div>
            ),
        },
    ]
}