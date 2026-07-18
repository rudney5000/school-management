import {
    useMemo,
    useState
} from "react"
import {useParams} from "@tanstack/react-router";
import {
    BarChart3,
    CalendarDays,
    ClipboardList,
    GraduationCap,
    PencilLine
} from "lucide-react";
import { useTranslation } from "@shared/lib"
import {
    Button,
    Tabs,
    TabsContent
} from "@/shared/ui"
import {GradeEntryGrid} from "@/pages/exams/ui/GradeEntryGrid";
import {ResultsBulletin} from "@/pages/exams/ui/results-bulletin/ResultsBulletin.tsx";
import {StatisticsDashboard} from "@/pages/exams/ui/StatisticsDashboard";
import {
    type Exam,
    ExamStatus,
    useExams
} from "@entities/exams";
import {ExamStats} from "@/pages/exams/ui/ExamStats";
import {getExamColumns} from "@/pages/exams/ui/ExamColumns";
import {ExamTable} from "@/pages/exams/ui/ExamTable";
import {ExamTableToolbar} from "@/pages/exams/ui/ExamTableToolbar";
import {useCourses} from "@entities/courses";
import {
    AddExamForm,
    DeleteExamAlert,
    EditExamForm
} from "@features/exams";

export function AssessmentsPage() {
    const { subSchoolId } = useParams({ strict: false })
    const { t } = useTranslation()
    const { data,  isLoading, isError } = useExams(subSchoolId)
    const [activeTab, setActiveTab] = useState("exams")
    const [examToEdit, setExamToEdit] = useState<Exam>()
    const [examToDelete, setExamToDelete] = useState<Exam>()
    const [examToGrade, setExamToGrade] = useState<Exam>()
    const [formOpen, setFormOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState('all')

    const tabs = [
        { value: 'exams',       label: t('dashboard.exams.tabs.exams'),      icon: CalendarDays },
        { value: 'grade-entry', label: t('dashboard.exams.tabs.gradeEntry'), icon: PencilLine },
        { value: 'results',     label: t('dashboard.exams.tabs.results'),    icon: ClipboardList },
        { value: 'statistics',  label: t('dashboard.exams.tabs.statistics'), icon: BarChart3 },
    ] as const

    const statusFilters = [
        { id: 'all',                label: t('dashboard.exams.filters.all') },
        { id: ExamStatus.Scheduled, label: t('dashboard.exams.filters.scheduled') },
        { id: ExamStatus.Ongoing,   label: t('dashboard.exams.filters.ongoing') },
        { id: ExamStatus.Completed, label: t('dashboard.exams.filters.completed') },
        { id: ExamStatus.Cancelled, label: t('dashboard.exams.filters.cancelled') },
    ]

    const { data: courses } = useCourses(subSchoolId)

    const courseMap = useMemo(
        () => new Map(courses?.map(c => [c.id, c.name]) ?? []),
        [courses]
    )

    const columns = useMemo(() => getExamColumns({
        t,
        examToEdit,
        courseMap,
        onEdit: setExamToEdit,
        onDelete: setExamToDelete,
        onViewGrades: (exam) => {
            setExamToGrade(exam);
            setActiveTab("grade-entry")
        }
    }), [t, examToEdit, courseMap])

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                            <GraduationCap className="size-6" strokeWidth={2.2}/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {t('dashboard.exams.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('dashboard.exams.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
                    <div className="overflow-x-auto pb-1">
                        <div
                            className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <Button
                                        variant="ghost"
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                            activeTab === tab.value
                                                ? 'bg-primary text-primary-foreground shadow-soft'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="size-4"/>
                                        {tab.value === activeTab ?
                                            <span className="font-semibold">{tab.label}</span> : tab.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    <TabsContent value="exams" className="space-y-6">
                        <ExamStats exams={data ?? []}/>
                        <ExamTable
                            columns={columns}
                            isLoading={isLoading}
                            isError={isError}
                            data={data ?? []}
                            title="exam table"
                            toolbar={({ onSearchChange }) => (
                                <ExamTableToolbar
                                    onSearchChange={onSearchChange}
                                    activeFilter={activeFilter}
                                    onFilterChange={setActiveFilter}
                                    statusFilters={statusFilters}
                                    onNew={() => setFormOpen(true)}
                                />
                            )}
                        />
                        <AddExamForm
                            isOpen={formOpen}
                            handleOpen={setFormOpen}
                            handleSuccess={() => setFormOpen(false)}
                            submitButtonLabel={t('dashboard.exams.fields.add')}
                        />

                        <EditExamForm
                            exam={examToEdit}
                            isOpen={!!examToEdit}
                            handleOpen={(open) => { if (!open) setExamToEdit(undefined) }}
                            handleSuccess={() => setExamToEdit(undefined)}
                        />
                        {examToDelete && (
                            <DeleteExamAlert
                                exam={examToDelete}
                                isOpen={!!examToDelete}
                                onOpenChange={(open) => { if (!open) setExamToDelete(undefined) }}
                                handleSuccess={() => setExamToDelete(undefined)}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="grade-entry">
                        {examToGrade ? (
                            <GradeEntryGrid
                                examId={examToGrade.id}
                                onClose={() => setExamToGrade(undefined)}
                            />
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
                                <div
                                    className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                    <PencilLine className="size-6"/>
                                </div>
                                <p className="mt-4 text-sm font-medium text-foreground">Aucun examen sélectionné</p>
                                <p>{t("dashboard.exams.gradeEntry.selectExam")}</p>
                            </div>
                        )
                        }
                    </TabsContent>

                    <TabsContent value="results">
                        <ResultsBulletin/>
                    </TabsContent>

                    <TabsContent value="statistics">
                        <StatisticsDashboard/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}