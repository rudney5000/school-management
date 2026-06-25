import {
    useState,
    useMemo
} from 'react'
import {
    Eye,
    Pencil,
    Trash2,
    Search,
    Plus,
    Filter
} from 'lucide-react'
import {
    Button,
    Card,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui'
import {type Exam, ExamStatus} from "@entities/exams";

interface ExamsTableProps {
    exams: Exam[]
    onViewGrades: (exam: Exam) => void
    onEdit: (exam: Exam) => void
    onDelete: (exam: Exam) => void
    onNew: () => void
}

const statusFilters: { id: ExamStatus | 'all'; label: string }[] = [
    { id: 'all',                  label: 'Tous' },
    { id: ExamStatus.Scheduled,   label: 'Planifiés' },
    { id: ExamStatus.Ongoing,     label: 'En cours' },
    { id: ExamStatus.Completed,   label: 'Terminés' },
    { id: ExamStatus.Cancelled,   label: 'Annulés' },
]

const typeStyles: Record<string, string> = {
    'Quiz': 'bg-purple-100 text-purple-700 border-purple-200',
    'Midterm': 'bg-blue-100 text-blue-700 border-blue-200',
    'Final': 'bg-red-100 text-red-700 border-red-200',
    'Homework': 'bg-green-100 text-green-700 border-green-200',
    'Oral': 'bg-amber-100 text-amber-700 border-amber-200',
}

const statusStyles: Record<ExamStatus, string> = {
    'scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
    'ongoing': 'bg-amber-100 text-amber-700 border-amber-200',
    'completed': 'bg-green-100 text-green-700 border-green-200',
    'cancelled': 'bg-red-100 text-red-700 border-red-200',
}

export function ExamsTable({ exams, onViewGrades, onEdit, onDelete, onNew }: ExamsTableProps) {
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<ExamStatus | 'all'>('all')

    const filtered = useMemo(() => {
        return exams.filter((e) => {
            const matchesSearch =
                (e.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (e.courseName ?? '').toLowerCase().includes(search.toLowerCase())
            const matchesFilter = activeFilter === 'all' || e.status === activeFilter
            return matchesSearch && matchesFilter
        })
    }, [exams, search, activeFilter])

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un examen, un cours…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft">
                        <Filter className="ml-1.5 mr-0.5 size-3.5 text-muted-foreground" />
                        {statusFilters.map((f) => (
                            <Button
                                variant="ghost"
                                key={f.id}
                                onClick={() => setActiveFilter(f.id)}
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
                        <Plus className="size-4" />
                        Nouvel examen
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead>Examen</TableHead>
                            <TableHead>Cours</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Aucun examen ne correspond à votre recherche.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((exam) => (
                                <TableRow key={exam.id} className="group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">{exam.title}</span>
                                            <span className="mt-0.5 text-xs text-muted-foreground">
                        {exam.durationMinutes > 0 ? `${exam.durationMinutes} min` : 'À rendre'} · /{exam.maxScore} · coeff. {exam.coefficient}
                      </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">{exam.courseName}</span>
                                    </TableCell>
                                    <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(exam.examDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                                    </TableCell>
                                    <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeStyles[exam.type]}`}>
                      {exam.type}
                    </span>
                                    </TableCell>
                                    <TableCell>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[exam.status]}`}>
                      <span className="size-1.5 rounded-full bg-current opacity-60" />
                        {exam.status === 'scheduled' ? 'Planifié' : exam.status === 'ongoing' ? 'En cours' : exam.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => onViewGrades(exam)}
                                                disabled={exam.status === 'scheduled'}
                                                title="Voir les notes"
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(exam)} title="Modifier">
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => onDelete(exam)}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
