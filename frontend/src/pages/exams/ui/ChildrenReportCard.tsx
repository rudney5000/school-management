import {useParams} from "@tanstack/react-router";
import {useState} from "react";
import {useTranslation} from "@shared/lib";
import {useMyChildren} from "@entities/student";
import {
    CalendarClock,
    ClipboardList,
    GraduationCap
} from "lucide-react";
import {
    Button,
    Spinner,
    Tabs,
    TabsContent,
} from "@shared/ui";
import {
    ChildResults
} from "@/pages/exams/ui/ChildResults";
import {
    ChildrenExamsTable
} from "@/pages/exams/ui/ChildrenExamsTable";

export function ChildrenReportCard() {
    const { subSchoolId } = useParams({ strict: false })
    const { t } = useTranslation()
    const { data: children, isLoading } = useMyChildren(subSchoolId!)
    const [activeTab, setActiveTab] = useState("results")

    const tabs = [
        { value: "results", label: t('dashboard.exams.reportCard.tabs.results'), icon: ClipboardList },
        { value: "upcoming", label: t('dashboard.exams.reportCard.tabs.upcoming'), icon: CalendarClock },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto px-4 py-8 sm:px-6">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                        <GraduationCap className="size-6" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {t('dashboard.exams.reportCard.title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('dashboard.exams.reportCard.description')}
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
                    <div className="overflow-x-auto pb-1">
                        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft">
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
                                        <Icon className="size-4" />
                                        {tab.value === activeTab ?
                                            <span className="font-semibold">{tab.label}</span> : tab.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    <TabsContent value="results">
                        {isLoading ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                <Spinner />
                                {t('dashboard.exams.reportCard.loading')}
                            </div>
                        ) : !children || children.length === 0 ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                {t('dashboard.exams.reportCard.noChildren')}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {children.map((child) => (
                                    <ChildResults key={child.id} student={child} subSchoolId={subSchoolId!} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming">
                        <ChildrenExamsTable />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}