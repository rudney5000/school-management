import type {ColumnDef} from "@tanstack/react-table";
import {
    CustomDataTable,
    type CustomDataTableProps
} from "@shared/ui";

interface DataTableConfig<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    getRowId: (row: TData) => string
    searchKey: keyof TData & string
}

export function withDataTable<TData, TValue = unknown>(
    config: DataTableConfig<TData, TValue>,
) {
    return function DataTableWrapper(
        props: Omit<CustomDataTableProps<TData, TValue>, 'getRowId' | 'searchKey'>,
    ) {
        return <CustomDataTable {...config} {...props} />
    }
}