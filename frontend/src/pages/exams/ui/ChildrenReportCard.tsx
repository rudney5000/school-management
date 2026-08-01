import {useParams} from "@tanstack/react-router";
import {useTranslation} from "@shared/lib";
import {useMyChildren} from "@entities/student";
import {GraduationCap} from "lucide-react";
import {Spinner} from "@shared/ui";
import {ChildResults} from "@/pages/exams/ui/ChildResults";

export function ChildrenReportCard() {
    const { subSchoolId } = useParams({ strict: false })
    const { t } = useTranslation()
    const { data: children, isLoading } = useMyChildren(subSchoolId!)

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
            </div>
        </div>
    )
}