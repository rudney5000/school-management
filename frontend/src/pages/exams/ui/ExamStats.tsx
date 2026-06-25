import {
    BarChart3,
    CheckCircle2,
    Clock,
    FileText
} from "lucide-react";
import type {Exam} from "@entities/exams";
import {useExamStats} from "@/pages/exams/lib/useExamStats";
import {StatCard} from "@/pages/exams/ui/StatCard";

export function ExamStats({ exams }: { exams: Exam[] }) {
    const { total, completed, scheduled, avg } = useExamStats(exams)
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total examens" value={total} icon={FileText} accent="primary" hint="Tous statuts" />
            <StatCard label="Terminés" value={completed} icon={CheckCircle2} accent="emerald" hint="Cette période" />
            <StatCard label="Planifiés" value={scheduled} icon={Clock} accent="amber" hint="À venir" />
            <StatCard label="Moyenne" value={`${avg}/20`} icon={BarChart3} accent="blue" hint="Examen terminés" />
        </div>
    )
}
