import type {ReactNode} from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { flexRender } from '@tanstack/react-table'
import type {
    ColumnDef,
    Row,
    Table
} from '@tanstack/react-table'
import {
    Table as UiTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shared/ui'
import { Button } from '@/shared/ui'
import { cn } from '@shared/lib/utils'

interface DataTableBodyProps<TData, TValue> {
    table: Table<TData>
    columns: ColumnDef<TData, TValue>[]
    onRowClick: (row: Row<TData>) => void
    selectedRow: TData | null
    renderDetailPanel?: (selected: TData | null) => ReactNode
}

export function DataTableBody<TData, TValue>({
                                                 table,
                                                 columns,
                                                 onRowClick,
                                                 selectedRow,
                                                 renderDetailPanel,
}: DataTableBodyProps<TData, TValue>) {
    return (
        <div className="flex flex-col xl:flex-row gap-5">
            <div className="flex-[7] min-w-0">
                <div className="rounded-2xl border border-zinc-100/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(23,85,236,0.05)] overflow-hidden">
                    <UiTable>
                        <TableHeader>
                            {table.getHeaderGroups().map(hg => (
                                <TableRow key={hg.id} className="border-b border-zinc-100 hover:bg-transparent">
                                    {hg.headers.map(header => (
                                        <TableHead key={header.id} className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map(row => {
                                    const isSelected = row.getIsSelected()
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-state={isSelected ? 'selected' : undefined}
                                            className={cn(
                                                'relative border-b border-zinc-50 cursor-pointer transition-colors h-[72px]',
                                                isSelected
                                                    ? 'bg-[#1755EC]/[0.04] hover:bg-[#1755EC]/[0.06] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-full before:bg-[#1755EC]'
                                                    : 'hover:bg-zinc-50/80',
                                            )}
                                            onClick={() => onRowClick(row)}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="px-4 py-3 align-middle"
                                                    onClick={e => { if (cell.column.id === 'actions') e.stopPropagation() }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-400">
                                        Aucun résultat trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </UiTable>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 px-1">
                    <span className="text-xs text-zinc-400">
                        {table.getFilteredRowModel().rows.length} résultat(s)
                    </span>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                            .slice(
                                Math.max(0, table.getState().pagination.pageIndex - 1),
                                table.getState().pagination.pageIndex + 2,
                            )
                            .map(page => (
                                <Button
                                    key={page} variant="outline" size="sm"
                                    className={cn(
                                        'h-8 w-8 rounded-xl text-xs p-0 border-zinc-200',
                                        table.getState().pagination.pageIndex + 1 === page &&
                                        'bg-[#1755EC] text-white border-[#1755EC] hover:bg-[#1755EC]/90 hover:text-white',
                                    )}
                                    onClick={() => table.setPageIndex(page - 1)}
                                >
                                    {page}
                                </Button>
                            ))}
                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-xl p-0 border-zinc-200"
                                onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-xl p-0 border-zinc-200"
                                onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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
    )
}