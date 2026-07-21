import { useState } from "react"
import {
    Filter,
    Plus,
    Search,
    User
} from "lucide-react"
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@shared/ui"
import { useTranslation } from "@shared/lib"
import type { Class } from "@entities/class"

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
    classes: Class[]
    selectedClassId: string
    onClassChange: (id: string) => void
    showTeacherToggle: boolean
    teacherOnly: boolean
    onTeacherOnlyChange: (value: boolean) => void
}

export function ExamTableToolbar({
                                     onSearchChange,
                                     activeFilter,
                                     onFilterChange,
                                     onNew,
                                     statusFilters,
                                     classes,
                                     selectedClassId,
                                     onClassChange,
                                     showTeacherToggle,
                                     teacherOnly,
                                     onTeacherOnlyChange,
                                 }: ExamTableToolbarProps) {
    const [search, setSearch] = useState('')
    const { t } = useTranslation()

    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0 sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder={t('dashboard.exams.searchPlaceholder')}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            onSearchChange(e.target.value)
                        }}
                        className="pl-9"
                    />
                </div>
                <Button size="sm" onClick={onNew} className="h-9 shrink-0">
                    <Plus className="size-4"/>
                    <span className="hidden sm:inline">{t('dashboard.exams.actions.new')}</span>
                </Button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={selectedClassId} onValueChange={onClassChange}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={t('dashboard.exams.filters.allClasses')}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('dashboard.exams.filters.allClasses')}</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {showTeacherToggle && (
                        <Button
                            variant="ghost"
                            onClick={() => onTeacherOnlyChange(!teacherOnly)}
                            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                teacherOnly
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'border border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                        >
                            <User className="size-3.5"/>
                            {t('dashboard.exams.filters.myExams')}
                        </Button>
                    )}
                </div>

                <div className="-mx-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
                    <div
                        className="flex w-max items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft">
                        <Filter className="ml-1.5 mr-0.5 size-3.5 shrink-0 text-muted-foreground"/>
                        {statusFilters.map((f) => (
                            <Button
                                variant="ghost"
                                key={f.id}
                                onClick={() => onFilterChange(f.id)}
                                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                    activeFilter === f.id
                                        ? 'bg-primary text-primary-foreground shadow-soft'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}