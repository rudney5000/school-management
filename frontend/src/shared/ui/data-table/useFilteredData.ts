import {useMemo} from "react";

type DataTableFilter<TData> = {
    id: string
    value: unknown
    field?: keyof TData
}

export function useFilteredData<TData>(
    data: TData[],
    filters: DataTableFilter<TData>[] | undefined,
    activeFilterId: string | undefined,
) {
    return useMemo(() => {
        const active = filters?.find(f => f.id === activeFilterId)
        if (!active || active.value === 'all') return data
        return data.filter(row => !active.field || row[active.field] === active.value)
    }, [data, filters, activeFilterId])
}