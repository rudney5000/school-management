import {useCallback, useEffect, useState} from "react";
import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

interface UseDataTableStateOptions<TData, TValue> {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    getRowId?: (row: TData) => string
    onRowSelect?: (row: TData | null) => void
}

export function useDataTableState<TData, TValue>({
                                                     data,
                                                     columns,
                                                     getRowId,
                                                     onRowSelect,
                                                 }: UseDataTableStateOptions<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

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
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    })

    const selectedRow = table.getFilteredSelectedRowModel().rows[0]?.original ?? null

    useEffect(() => {
        onRowSelect?.(selectedRow)
    }, [selectedRow, onRowSelect])

    const handleRowClick = useCallback(
        (row: import('@tanstack/react-table').Row<TData>) => {
            table.setRowSelection({ [row.id]: true })
        },
        [table],
    )

    return { table, selectedRow, handleRowClick }
}