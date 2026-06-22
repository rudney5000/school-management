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
import {
    EditParentForm,
    DeleteParentAlert
} from '@features/parent'
import {cn, getInitials} from '@shared/lib'
import type {Parent} from "@entities/parent";
import type {TFunction} from "i18next";

interface ParentColumnsOptions {
    t: TFunction
    parentToUpdate: Parent | undefined
    parentToDelete: Parent | undefined
    onEdit: (parent: Parent) => void
    onDelete: (parent: Parent) => void
    onCancelEdit: () => void
    onCancelDelete: () => void
}

export function getParentColumns({
                                     t,
                                     parentToUpdate,
                                     parentToDelete,
                                     onEdit,
                                     onDelete,
                                     onCancelEdit,
                                     onCancelDelete,
}: ParentColumnsOptions): ColumnDef<Parent>[] {

    return [
        {
            id: 'select',
            size: 40,
            header: ({ table }) => (
                <div className="w-4">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Tout sélectionner"
                        className="border-zinc-300 data-checked:bg-[#1755EC] data-checked:border-[#1755EC]"
                    />
                </div>
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
                const fullName = `${row.original.firstName} ${row.original.lastName}`
                const image = row.original.image ?? `https://i.pravatar.cc/150?u=${row.original.id}`
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={image} alt={fullName} />
                            <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-xs font-semibold">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">{fullName}</p>
                            <p className="text-xs text-zinc-400 truncate lowercase">{row.original.email}</p>
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
            cell: ({ row }) => (
                <span className="text-sm text-zinc-600">
                    {row.getValue('gender') === 'male'
                        ? t('dashboard.parents.gender.male')
                        : t('dashboard.parents.gender.female')}
                </span>
            ),
        },
        {
            id: 'contact',
            header: t('dashboard.parents.columns.contact'),
            enableSorting: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                            title={row.original.email}
                            onClick={() => navigator.clipboard.writeText(row.original.email)}>
                        <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                            title={row.original.phone}
                            onClick={() => row.original.phone && navigator.clipboard.writeText(row.original.phone)}>
                        <Phone className="h-4 w-4" />
                    </Button>
                </div>
            ),
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
                    <Badge className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium border-0',
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                    )}>
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
                        onEditAction={() => onEdit(row.original)}
                        onDeleteAction={() => onDelete(row.original)}
                    />
                    <EditParentForm
                        parent={row.original}
                        isOpen={parentToUpdate?.id === row.original.id}
                        handleOpen={onCancelEdit}
                        handleSuccess={onCancelEdit}
                    />
                    <DeleteParentAlert
                        parent={row.original}
                        isOpen={parentToDelete?.id === row.original.id}
                        onOpenChange={(open) => { if (!open) onCancelDelete() }}
                        handleSuccess={onCancelDelete}
                    />
                </div>
            ),
        },
    ]
}