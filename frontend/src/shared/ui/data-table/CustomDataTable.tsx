import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table'
import {
    Button,
    Checkbox,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui'
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { StatCardsRow, type StatCardItem } from './StatCardsRow'

interface CustomDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    title: string
    subtitle?: string
    stats?: StatCardItem[]
    children?: React.ReactNode
    renderDetailPanel?: (selected: TData | null) => React.ReactNode
    isLoading?: boolean
    isError?: boolean
    loadingMessage?: string
    errorMessage?: string
    getRowId?: (row: TData) => string
    onRowSelect?: (row: TData | null) => void
}

export function CustomDataTable<TData, TValue>({
    columns,
    data,
    searchKey = 'name',
    searchPlaceholder,
    title,
    subtitle,
    stats,
    children,
    renderDetailPanel,
    isLoading = false,
    isError = false,
    loadingMessage = 'Chargement...',
    errorMessage = 'Une erreur est survenue',
    getRowId,
    onRowSelect,
}: CustomDataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
    const [showFilters, setShowFilters] = React.useState(false)

    const table = useReactTable({
        data,
        columns,
        getRowId: getRowId ? (row) => getRowId(row) : undefined,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        enableMultiRowSelection: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const selectedRow = table.getFilteredSelectedRowModel().rows[0]?.original ?? null

    React.useEffect(() => {
        onRowSelect?.(selectedRow)
    }, [selectedRow, onRowSelect])

    const handleRowClick = (row: Row<TData>) => {
        table.setRowSelection({ [row.id]: true })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-zinc-500">
                {loadingMessage}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-rose-500">
                {errorMessage}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="relative w-full sm:w-56 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder={searchPlaceholder ?? `Rechercher...`}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                            onChange={(e) =>
                                table.getColumn(searchKey)?.setFilterValue(e.target.value)
                            }
                            className="pl-9 h-10 rounded-2xl bg-white border-zinc-200/80 shadow-sm focus-visible:ring-[#1755EC]/20"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-2xl border-zinc-200/80 bg-white shadow-sm gap-2 px-4"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        <Filter className="h-4 w-4 text-zinc-500" />
                        Filtrer
                    </Button>

                    {children}
                </div>
            </div>

            {stats && stats.length > 0 && <StatCardsRow stats={stats} />}

            {showFilters && (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-zinc-100 p-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <SlidersHorizontal className="h-4 w-4 text-zinc-400 ml-1" />
                    <span className="text-xs text-zinc-500 mr-2">Statut :</span>
                    {(['all', 'active', 'inactive'] as const).map((filter) => (
                        <Button
                            key={filter}
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-7 rounded-full text-xs border-zinc-200',
                                (filter === 'all' && !columnFilters.length) ||
                                    (filter === 'active' &&
                                        columnFilters.find((f) => f.id === 'isActive')?.value === true) ||
                                    (filter === 'inactive' &&
                                        columnFilters.find((f) => f.id === 'isActive')?.value === false)
                                    ? 'bg-[#1755EC] text-white border-[#1755EC] hover:bg-[#1755EC]/90 hover:text-white'
                                    : 'bg-white text-zinc-600 hover:bg-zinc-50'
                            )}
                            onClick={() => {
                                if (filter === 'all') {
                                    setColumnFilters([])
                                } else {
                                    setColumnFilters([
                                        { id: 'isActive', value: filter === 'active' },
                                    ])
                                }
                            }}
                        >
                            {filter === 'all'
                                ? 'Tous'
                                : filter === 'active'
                                  ? 'Actifs'
                                  : 'Inactifs'}
                        </Button>
                    ))}
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-5">
                <div className="flex-[7] min-w-0">
                    <div className="rounded-2xl border border-zinc-100/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(23,85,236,0.05)] overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b border-zinc-100 hover:bg-transparent"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => {
                                        const isSelected = row.getIsSelected()

                                        return (
                                            <TableRow
                                                key={row.id}
                                                data-state={isSelected ? 'selected' : undefined}
                                                className={cn(
                                                    'relative border-b border-zinc-50 cursor-pointer transition-colors h-[72px]',
                                                    isSelected
                                                        ? 'bg-[#1755EC]/[0.04] hover:bg-[#1755EC]/[0.06] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-full before:bg-[#1755EC]'
                                                        : 'hover:bg-zinc-50/80'
                                                )}
                                                onClick={() => handleRowClick(row)}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className="px-4 py-3 align-middle"
                                                        onClick={(e) => {
                                                            if (cell.column.id === 'actions') {
                                                                e.stopPropagation()
                                                            }
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-32 text-center text-zinc-400"
                                        >
                                            Aucun résultat trouvé.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4 px-1">
                        <span className="text-xs text-zinc-400">
                            {table.getFilteredRowModel().rows.length} résultat(s)
                        </span>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                                .slice(
                                    Math.max(0, table.getState().pagination.pageIndex - 1),
                                    table.getState().pagination.pageIndex + 2
                                )
                                .map((page) => (
                                    <Button
                                        key={page}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            'h-8 w-8 rounded-xl text-xs p-0 border-zinc-200',
                                            table.getState().pagination.pageIndex + 1 === page &&
                                                'bg-[#1755EC] text-white border-[#1755EC] hover:bg-[#1755EC]/90 hover:text-white'
                                        )}
                                        onClick={() => table.setPageIndex(page - 1)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-xl p-0 border-zinc-200"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-xl p-0 border-zinc-200"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {renderDetailPanel && (
                    <div className="flex-[3] min-w-[280px] xl:max-w-[360px] shrink-0">
                        {renderDetailPanel(selectedRow)}
                    </div>
                )}
            </div>
        </div>
    )
}

export function SelectionCheckbox<TData>({
    row,
}: {
    row: Row<TData>
}) {
    return (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Sélectionner la ligne"
            className="border-zinc-300 data-checked:bg-[#1755EC] data-checked:border-[#1755EC]"
        />
    )
}
