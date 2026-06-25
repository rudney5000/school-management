import { useState } from "react"
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
import {ExamsTable} from "@/pages/exams/ui/ExamsTable";
import {GradeEntryGrid} from "@/pages/exams/ui/GradeEntryGrid";
import {ResultsBulletin} from "@/pages/exams/ui/ResultsBulletin";
import {StatisticsDashboard} from "@/pages/exams/ui/StatisticsDashboard";
import {
    type Exam,
    useDeleteExam,
    useExams
} from "@entities/exams";
import {ExamStats} from "@/pages/exams/ui/ExamStats";

const tabs = [
    { value: 'exams', label: 'Examens', icon: CalendarDays },
    { value: 'grade-entry', label: 'Saisie des notes', icon: PencilLine },
    { value: 'results', label: 'Résultats', icon: ClipboardList },
    { value: 'statistics', label: 'Statistiques', icon: BarChart3 },
] as const

export function ExamPage() {
    const { subSchoolId } = useParams({ strict: false })
    const { t } = useTranslation()
    const { data: exams = [] } = useExams(subSchoolId)
    const removeExam = useDeleteExam()
    const [activeTab, setActiveTab] = useState("exams")
    const [examToEdit, setExamToEdit] = useState<Exam | null>(null)
    const [examToGrade, setExamToGrade] = useState<Exam | null>(null)
    const [formOpen, setFormOpen] = useState(false)

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
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Centre d'examens</h1>
                            <p className="text-sm text-muted-foreground">Gérez les examens, la saisie des notes et
                                l'analyse des résultats.</p>
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
                        <ExamStats exams={exams}/>
                        <ExamsTable
                            exams={exams}
                            onViewGrades={(exam) => {
                                setExamToGrade(exam);
                                setActiveTab("grade-entry")
                            }}
                            onEdit={(exam) => {
                                setExamToEdit(exam);
                                setFormOpen(true)
                            }}
                            onDelete={(exam) => removeExam.mutate({id: exam.id, subSchoolId: exam.subSchoolId})}
                            onNew={() => {
                                setExamToEdit(null);
                                setFormOpen(true)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="grade-entry">
                        {examToGrade ? (
                            <GradeEntryGrid
                                examId={examToGrade.id}
                                onClose={() => setExamToGrade(null)}
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