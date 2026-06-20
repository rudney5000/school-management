import {
    ArrowLeft,
    ArrowRight
} from "lucide-react"
import { Button } from "@/shared/ui"
import {useTranslation} from "@shared/lib";

interface AttendanceTablePaginationProps {
    page: number
    setPage: (page: number) => void
    totalPages: number
    totalResults: number
    accent: string
}

export function AttendanceTablePagination({ page, setPage, totalPages, totalResults, accent }: AttendanceTablePaginationProps) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                    {t('dashboard.attendance.table.pagination.show')}
                </span>
                <span className="border border-border rounded px-2 py-1 text-foreground font-medium">10</span>
                <span>
                    {t('dashboard.attendance.table.pagination.of')}
                    {totalResults}
                    {t('dashboard.attendance.table.pagination.results')}
                </span>
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start">
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    <ArrowLeft className="size-3" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                    <Button
                        key={i + 1}
                        size="icon"
                        className="size-7 text-xs"
                        variant={page === i + 1 ? "default" : "outline"}
                        style={page === i + 1 ? { background: accent } : undefined}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </Button>
                ))}
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    <ArrowRight className="size-3" />
                </Button>
            </div>
        </div>
    )
}