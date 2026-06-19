import React from 'react'
import { useParams } from "@tanstack/react-router"
import type { ColumnDef } from '@tanstack/react-table'
import {
    ArrowUpDown,
    Building2,
    GraduationCap,
    Presentation,
    Users
} from 'lucide-react'
import {
    Badge,
    Button
} from '@shared/ui'
import {CustomDataTable} from '@shared/ui/data-table'
import {
    type Class,
    useClasses
} from "@entities/class"
import {
    AddClassForm,
    EditClassForm,
    DeleteClassAlert
} from '@features/class'
import { ActionsComponent } from "@shared/ui/common/ActionsComponent"
import {
    cn,
    useTranslation
} from "@shared/lib"
import {
    ClassDetailPanel,
    EmptyDetailPanel
} from "@/pages/class/ui";


const ClassesPage = () => {
    const [activeFilter, setActiveFilter] = React.useState<string>('all')
    const [selectedClass, setSelectedClass] = React.useState<Class | null>(null)
    const [isAddFormOpen, setIsAddFormOpen] = React.useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = React.useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false)

    const { t } = useTranslation()
    const { subSchoolId } = useParams({ strict: false })
    const { data: classes = [], isLoading } = useClasses(subSchoolId)

    const filteredData = React.useMemo(() => {
        if (activeFilter === 'active') return classes.filter((c) => c.isActive)
        if (activeFilter === 'inactive') return classes.filter((c) => !c.isActive)
        return classes
    }, [activeFilter, classes])

    const stats = [
        { label: 'Total classes', value: classes.length, icon: GraduationCap, trend: { value: '+12%', positive: true }, accent: 'primary' as const },
        { label: 'Élèves inscrits', value: classes.reduce((acc, c) => acc + (c.studentsCount || 0), 0), icon: Users, trend: { value: '+8%', positive: true }, accent: 'info' as const },
        { label: 'Enseignants', value: new Set(classes.map((c) => c.teacher).filter(Boolean)).size, icon: Presentation, trend: { value: '+3%', positive: true }, accent: 'success' as const },
        { label: 'Capacité totale', value: classes.reduce((acc, c) => acc + c.capacity, 0), icon: Building2, accent: 'warning' as const },
    ]

    const columns: ColumnDef<Class>[] = [
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
                    onEditAction={() => {
                        setSelectedClass(row.original)
                        setIsEditFormOpen(true)
                    }}
                    onDeleteAction={() => {
                        setSelectedClass(row.original)
                        setIsDeleteAlertOpen(true)
                    }}
                />
            ),
        },
    ]

    const handleRowSelect = (row: Class | null) => {
        setSelectedClass(row);
    };

    const handleAddSuccess = () => {
        setIsAddFormOpen(false)
    }

    const handleEditSuccess = () => {
        setIsEditFormOpen(false)
        setSelectedClass(null)
    }

    const handleDeleteSuccess = () => {
        setIsDeleteAlertOpen(false)
        setSelectedClass(null)
    }

    const filters = [
        { id: 'all', label: 'Tous', value: '' },
        { id: 'active', label: 'Actifs', value: 'true' },
        { id: 'inactive', label: 'Inactifs', value: 'false' },
    ]

    return (
        <>
            <CustomDataTable
                columns={columns}
                data={filteredData}
                searchKey="name"
                searchPlaceholder="Rechercher une classe..."
                title="Classes"
                subtitle="Gérez et suivez toutes les classes de votre établissement"
                stats={stats}
                filters={filters}
                activeFilterId={activeFilter}
                onFilterChange={setActiveFilter}
                getRowId={(row) => row.id}
                onRowSelect={handleRowSelect}
                renderDetailPanel={(selected) => selected ? <ClassDetailPanel classItem={selected} /> : <EmptyDetailPanel />}
                isLoading={isLoading}
            >
                <Button className="h-10 rounded-xl gap-2 px-4" onClick={() => setIsAddFormOpen(true)}>
                    {t('dashboard.classes.add_class')}
                </Button>
            </CustomDataTable>

            <AddClassForm
                isOpen={isAddFormOpen}
                handleOpen={() => setIsAddFormOpen(false)}
                handleSuccess={handleAddSuccess}
            />

            {selectedClass && (
                <EditClassForm
                    classItem={selectedClass}
                    isOpen={isEditFormOpen}
                    handleOpen={() => setIsEditFormOpen(false)}
                    handleSuccess={handleEditSuccess}
                />
            )}

            {selectedClass && (
                <DeleteClassAlert
                    classItem={selectedClass}
                    isOpen={isDeleteAlertOpen}
                    onOpenChange={setIsDeleteAlertOpen}
                    handleSuccess={handleDeleteSuccess}
                />
            )}
        </>
    )
}

export default ClassesPage