import {
    BarChart3,
    CheckCircle2,
    Clock,
    FileText
} from "lucide-react";
import type {Exam} from "@entities/exams";
import {useExamStats} from "@/pages/exams/lib/useExamStats";
import {StatCard} from "@/pages/exams/ui/StatCard";
import {useTranslation} from "@shared/lib";

interface ExamStatsProps {
    exams: Exam[]
    showAverage?: boolean
}

export function ExamStats({ exams, showAverage = true }: ExamStatsProps) {
    const { t } = useTranslation()
    const { total, completed, scheduled, avg } = useExamStats(exams)
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
                label={t('dashboard.exams.stats.total')}
                value={total}
                icon={FileText}
                accent="primary"
                hint={t('dashboard.exams.stats.totalHint')}
            />
            <StatCard
                label={t('dashboard.exams.stats.completed')}
                value={completed}
                icon={CheckCircle2}
                accent="emerald"
                hint={t('dashboard.exams.stats.completedHint')}
            />
            <StatCard
                label={t('dashboard.exams.stats.scheduled')}
                value={scheduled}
                icon={Clock}
                accent="amber"
                hint={t('dashboard.exams.stats.scheduledHint')}
            />
            {showAverage && (
                <StatCard
                    label={t('dashboard.exams.stats.average')}
                    value={`${avg}/20`}
                    icon={BarChart3}
                    accent="blue"
                    hint={t('dashboard.exams.stats.averageHint')}
                />
            )}
        </div>
    )
}