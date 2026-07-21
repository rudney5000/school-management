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
import type {AcademicPeriod} from "@entities/academic-period";

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
    academicPeriods: AcademicPeriod[]
    selectedPeriodId: string
    onPeriodChange: (id: string) => void
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
                                     academicPeriods,
                                     selectedPeriodId,
                                     onPeriodChange,
                                     showTeacherToggle,
                                     teacherOnly,
                                     onTeacherOnlyChange,
                                 }: ExamTableToolbarProps) {
    const [search, setSearch] = useState('')
    const { t } = useTranslation()

    return (
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex w-max items-center gap-2">
                <div className="relative w-[200px] shrink-0">
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

                <Select value={selectedClassId} onValueChange={onClassChange}>
                    <SelectTrigger className="w-[160px] shrink-0">
                        <SelectValue placeholder={t('dashboard.exams.filters.allClasses')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dashboard.exams.filters.allClasses')}</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedPeriodId} onValueChange={onPeriodChange}>
                    <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder={t('dashboard.exams.filters.allPeriods')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dashboard.exams.filters.allPeriods')}</SelectItem>
                        {academicPeriods.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {showTeacherToggle && (
                    <Button
                        variant="ghost"
                        onClick={() => onTeacherOnlyChange(!teacherOnly)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                            teacherOnly
                                ? 'bg-primary text-primary-foreground shadow-soft'
                                : 'border border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                    >
                        <User className="size-3" />
                        {t('dashboard.exams.filters.myExams')}
                    </Button>
                )}

                <div
                    className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/70 bg-card p-0.5 shadow-soft">
                    <Filter className="ml-1 mr-0.5 size-3 shrink-0 text-muted-foreground"/>
                    {statusFilters.map((f) => (
                        <Button
                            variant="ghost"
                            size="sm"
                            key={f.id}
                            onClick={() => onFilterChange(f.id)}
                            className={`h-6 shrink-0 rounded-md px-2 py-0 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                activeFilter === f.id
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>

                <Button size="sm" onClick={onNew} className="h-8 shrink-0">
                    <Plus className="size-3"/>
                    {t('dashboard.exams.actions.new')}
                </Button>
            </div>
        </div>
    )
}