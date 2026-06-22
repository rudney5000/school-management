import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@shared/lib/utils'

type DataTableFilter = { id: string; label: string; value: unknown }

interface DataTableFiltersProps {
    filters: DataTableFilter[]
    activeFilterId?: string
    onFilterChange?: (id: string) => void
}

export function DataTableFilters({
                                     filters,
                                     activeFilterId,
                                     onFilterChange
}: DataTableFiltersProps) {
    if (!filters.length) return null

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-zinc-100 p-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400 ml-1" />
            <span className="text-xs text-zinc-500 mr-2">Statut :</span>
            {filters.map(filter => (
                <Button
                    key={filter.id}
                    variant="outline" size="sm"
                    className={cn(
                        'h-7 rounded-full text-xs border-zinc-200',
                        activeFilterId === filter.id
                            ? 'bg-[#1755EC] text-white border-[#1755EC] hover:bg-[#1755EC]/90 hover:text-white'
                            : 'bg-white text-zinc-600 hover:bg-zinc-50',
                    )}
                    onClick={() => onFilterChange?.(filter.id)}
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    )
}