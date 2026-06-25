import {useState} from "react";
import {
    Filter,
    Plus,
    Search
} from "lucide-react";
import {
    Button,
    Input
} from "@shared/ui";

interface StatusFilter {
    id: string
    label: string
}

interface ExamTableToolbarProps {
    onSearchChange: (value: string) => void
    activeFilter: string
    onFilterChange: (id: string) => void
    onNew?: () => void
    statusFilters: StatusFilter[]
}

export function ExamTableToolbar({
                                     onSearchChange,
                                     activeFilter,
                                     onFilterChange,
                                     onNew,
                                     statusFilters
}: ExamTableToolbarProps) {
    const [search, setSearch] = useState('')

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    placeholder="Rechercher un examen, un cours…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        onSearchChange(e.target.value)
                    }}
                    className="pl-9"
                />
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft">
                    <Filter className="ml-1.5 mr-0.5 size-3.5 text-muted-foreground"/>
                    {statusFilters.map((f) => (
                        <Button
                            variant="ghost"
                            key={f.id}
                            onClick={() => onFilterChange(f.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                activeFilter === f.id
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
                <Button size="sm" onClick={onNew} className="h-9">
                    <Plus className="size-4"/>
                    Nouvel examen
                </Button>
            </div>
        </div>
    )
}
