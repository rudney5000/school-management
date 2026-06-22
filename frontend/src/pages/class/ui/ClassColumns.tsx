import type { ColumnDef } from '@tanstack/react-table'
import {ArrowUpDown} from 'lucide-react'
import {
    Badge,
    Button
} from '@shared/ui'
import { ActionsComponent } from '@shared/ui/common/ActionsComponent'
import {cn} from '@shared/lib'
import type {TFunction} from "i18next";
import type {Class} from "@entities/class";

interface ClassColumnsOptions {
    t: TFunction
    onEdit: (classItem: Class) => void
    onDelete: (classItem: Class) => void
}

export function getClassColumns({
                                     t,
                                     onEdit,
                                     onDelete,
}: ClassColumnsOptions): ColumnDef<Class>[] {

    return [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {t('dashboard.classes.columns.name')} <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                        {(row.getValue('name') as string)?.[0]}
                    </div>
                    <span className="font-medium text-foreground">{row.getValue('name')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'gradeLevel',
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Niveau <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground">
                    {row.getValue('gradeLevel')}
                </Badge>
            ),
        },
        {
            accessorKey: 'teacher',
            header: 'Enseignant',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground text-[11px] font-medium flex-shrink-0">
                        {(row.getValue('teacher') as string)?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm text-foreground">{row.getValue('teacher')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'studentsCount',
            header: 'Effectif',
            cell: ({ row }) => {
                const count = row.getValue('studentsCount') as number
                const capacity = row.original.capacity
                const ratio = Math.round((count / capacity) * 100)
                return (
                    <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">{count}/{capacity}</span>
                            <span className="text-muted-foreground">{ratio}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={cn('h-full rounded-full', ratio >= 100 ? 'bg-rose-500' : ratio >= 80 ? 'bg-amber-500' : 'bg-primary')}
                                style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Statut',
            cell: ({ row }) => (
                <Badge
                    variant="secondary"
                    className={cn(
                        'gap-1.5 font-medium',
                        row.getValue('isActive')
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-100'
                    )}
                >
                    <span className={cn('h-1.5 w-1.5 rounded-full', row.getValue('isActive') ? 'bg-emerald-500' : 'bg-zinc-400')} />
                    {row.getValue('isActive') ? 'Actif' : 'Inactif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => (
                <ActionsComponent<Class>
                    row={row}
                    onEditAction={() => onEdit(row.original)}
                    onDeleteAction={() => onDelete(row.original)}
                />
            ),
        },
    ]
}