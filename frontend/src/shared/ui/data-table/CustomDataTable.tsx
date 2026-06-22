import {useState} from "react";
import type { ColumnDef } from '@tanstack/react-table'
import {
    StatCardsRow,
    type StatCardItem
} from '@shared/ui'
import {useFilteredData} from "@shared/ui/data-table/useFilteredData";
import {useDataTableState} from "@shared/ui/data-table/useDataTableState";
import {DataTableHeader} from "@shared/ui/data-table/DataTableHeader";
import {DataTableFilters} from "@shared/ui/data-table/DataTableFilters";
import {DataTableBody} from "@shared/ui/data-table/DataTableBody";

type DataTableFilter<TData, TValue = unknown> = {
    id: string;
    label: string;
    value: TValue;
    field?: keyof TData;
};

export interface CustomDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    filters?: DataTableFilter<TData, unknown>[];
    activeFilterId?: string;
    onFilterChange?: (id: string) => void;
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
                                                   filters,
                                                   activeFilterId,
                                                   onFilterChange,
                                                   title,
                                                   subtitle,
                                                   stats,
                                                   children,
                                                   renderDetailPanel,
                                                   isLoading,
                                                   isError,
                                                   loadingMessage = 'Chargement...',
                                                   errorMessage = 'Une erreur est survenue',
                                                   getRowId,
                                                   onRowSelect,
}: CustomDataTableProps<TData, TValue>) {
    const [_showFilters, setShowFilters] = useState(false)

    const filteredData = useFilteredData(data, filters, activeFilterId)
    const { table, selectedRow, handleRowClick } = useDataTableState({
        data: filteredData, columns, getRowId, onRowSelect,
    })

    if (isLoading) return <div className="flex items-center justify-center min-h-[400px] text-zinc-500">{loadingMessage}</div>
    if (isError)   return <div className="flex items-center justify-center min-h-[400px] text-rose-500">{errorMessage}</div>

    return (
        <div className="space-y-6">
            <DataTableHeader
                table={table} title={title} subtitle={subtitle}
                searchKey={searchKey} searchPlaceholder={searchPlaceholder}
                onToggleFilters={() => setShowFilters(p => !p)}
            >
                {children}
            </DataTableHeader>

            {stats?.length ? <StatCardsRow stats={stats} /> : null}

            {filters?.length ? (
                <DataTableFilters
                    filters={filters}
                    activeFilterId={activeFilterId}
                    onFilterChange={onFilterChange}
                />
            ) : null}

            <DataTableBody
                table={table} columns={columns}
                onRowClick={handleRowClick} selectedRow={selectedRow}
                renderDetailPanel={renderDetailPanel}
            />
        </div>
    )
}

