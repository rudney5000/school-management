import type {ReactNode} from "react";
import { Search, Filter } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import type { Table } from '@tanstack/react-table'
import {useTranslation} from "@shared/lib";

interface DataTableHeaderProps<TData> {
    table: Table<TData>
    title: string
    subtitle?: string
    searchKey: string
    searchPlaceholder?: string
    onToggleFilters: () => void
    children?: ReactNode
}

export function DataTableHeader<TData>({
                                           table,
                                           title,
                                           subtitle,
                                           searchKey,
                                           searchPlaceholder,
                                           onToggleFilters,
                                           children,
}: DataTableHeaderProps<TData>) {

    const { t } = useTranslation()

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-56 lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder={searchPlaceholder ?? t('dashboard.common.dataTable.search')}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                        onChange={e => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                        className="pl-9 h-10 rounded-2xl bg-white border-zinc-200/80 shadow-sm focus-visible:ring-[#1755EC]/20"
                    />
                </div>
                <Button
                    variant="outline" size="sm"
                    className="h-10 rounded-2xl border-zinc-200/80 bg-white shadow-sm gap-2 px-4"
                    onClick={onToggleFilters}
                >
                    <Filter className="h-4 w-4 text-zinc-500" />
                    {t('dashboard.common.dataTable.filter')}
                </Button>
                {children}
            </div>
        </div>
    )
}