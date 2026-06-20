import { Button } from "@/shared/ui"
import {
    formatDateLabel,
    getDayMeta
} from "@/pages/attendances/lib/dateUtils";
import {useTranslation} from "@shared/lib";
import {useDateLocale} from "@shared/lib/date";

interface AttendanceDayHeaderCellProps {
    day: Date
    canEdit: boolean
    editingDate: string | null
    onToggleEdit: (dateKey: string) => void
}

export function AttendanceDayHeaderCell({
                                            day,
                                            canEdit,
                                            editingDate,
                                            onToggleEdit
}: AttendanceDayHeaderCellProps) {
    const { t } = useTranslation()
    const locale = useDateLocale()
    const { dateKey, isPast, isFutureDay, isEditingThisDate } = getDayMeta(day, editingDate)

    return (
        <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap min-w-[90px]">
            <div className="flex flex-col items-center gap-1">
                <span>{formatDateLabel(day, locale)}</span>
                {canEdit && isPast && (
                    <Button
                        variant="outline"
                        onClick={() => onToggleEdit(dateKey)}
                        className={`h-5 text-[9px] px-1.5 py-0.5 ${
                            isEditingThisDate ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'hover:bg-amber-100 hover:text-amber-700'
                        }`}
                    >
                        {isEditingThisDate
                            ? t('dashboard.attendance.table.actions.cancel')
                            : t('dashboard.attendance.table.actions.edit')}
                    </Button>
                )}
                {canEdit && isFutureDay && (
                    <Button
                        variant="outline"
                        onClick={() => onToggleEdit(dateKey)}
                        className={`h-5 text-[9px] px-1.5 py-0.5 ${
                            isEditingThisDate ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : 'hover:bg-blue-100 hover:text-blue-700'
                        }`}
                    >
                        {isEditingThisDate
                            ? t('dashboard.attendance.table.actions.cancel')
                            : t('dashboard.attendance.table.actions.schedule')}
                    </Button>
                )}
            </div>
        </th>
    )
}