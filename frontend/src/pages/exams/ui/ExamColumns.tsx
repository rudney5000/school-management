import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns/format"
import type { TFunction } from "i18next"
import {
    getStatusBadgeClass,
    getTypeBadgeClass,
    type Exam
} from "@entities/exams";
import {ActionsComponent} from "@shared/ui/common/ActionsComponent.tsx";
import {Button} from "@shared/ui";
import {Copy, ExternalLink} from "lucide-react";

interface GetColumnsOptions {
    t: TFunction
    examToEdit: Exam | undefined
    courseMap: Map<string, string>
    onViewGrades: (exam: Exam) => void
    onEdit: (exam: Exam) => void
    onDelete: (exam: Exam) => void
}

export function getExamColumns({
                                   t,
                                   courseMap,
                                   onViewGrades,
                                   onEdit,
                                   onDelete
}: GetColumnsOptions): ColumnDef<Exam>[] {
    return [
        {
            accessorKey: "title",
            header: t("dashboard.exams.columns.title"),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{row.original.title}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                        {row.original.durationMinutes} min · /{row.original.maxScore} · coeff. {row.original.coefficient}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "courseId",
            header: t("dashboard.exams.columns.course"),
            cell: ({ getValue }) => (
                <span className="text-sm text-muted-foreground">
                    {courseMap.get(getValue() as string) ?? '—'}
                </span>
            ),
        },
        {
            accessorKey: "examDate",
            header: t("dashboard.exams.columns.date"),
            cell: ({ getValue }) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(getValue() as string), "dd MMM yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "type",
            header: t("dashboard.exams.columns.type"),
            cell: ({ getValue }) => {
                const type = getValue() as Exam["type"]
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(type)}`}>
                        {t(`dashboard.exams.types.${type}`)}
                    </span>
                )
            },
        },
        {
            accessorKey: "status",
            header: t("dashboard.exams.columns.status"),
            cell: ({ getValue }) => {
                const status = getValue() as Exam["status"]
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
                        {t(`dashboard.exams.statuses.${status}`)}
                    </span>
                )
            },
        },
        {
            accessorKey: "liveUrl",
            header: t("dashboard.exams.columns.live"),
            cell: ({ row }) => {
                if (!row.original.isLiveSession || !row.original.liveUrl) {
                    return <span className="text-sm text-muted-foreground">—</span>
                }
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => window.open(row.original.liveUrl, '_blank')}
                            title="Ouvrir le live"
                        >
                            <ExternalLink size={13} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => navigator.clipboard.writeText(row.original.liveUrl!)}
                            title="Copier le lien"
                        >
                            <Copy size={13} />
                        </Button>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                return (
                    <ActionsComponent<Exam>
                        row={row}
                        onEditAction={() => onEdit(row.original)}
                        onDeleteAction={() => onDelete(row.original)}
                        onViewAction={() => onViewGrades(row.original)}
                    />
                )
            },
        },
    ]
}