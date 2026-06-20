import { StatusToggle } from "@/pages/attendances/ui/StatusToggle"
import { type AttendanceStatus } from "@entities/attendances"
import {getDayMeta} from "@/pages/attendances/lib/dateUtils";
import {StatusIcon} from "@/pages/attendances/ui/StatusIcon";

interface AttendanceCellProps {
    day: Date
    status?: AttendanceStatus
    canEdit: boolean
    editingDate: string | null
    onChange: (date: string, status: AttendanceStatus) => void
}

export function AttendanceCell({ day, status, canEdit, editingDate, onChange }: AttendanceCellProps) {
    const { dateKey, isPast, isFutureDay, isToday, isEditingThisDate } = getDayMeta(day, editingDate)

    const editable = canEdit && (
        isToday ||
        (isPast && isEditingThisDate) ||
        (isFutureDay && isEditingThisDate)
    )

    return (
        <td className="px-2 py-3 text-center">
            <div className="flex justify-center">
                {editable ? (
                    <StatusToggle
                        status={status}
                        onChange={(newStatus) => onChange(dateKey, newStatus)}
                        allowedStatuses={isFutureDay ? ['PRESENT', 'ABSENT', 'EXCUSED'] : undefined}
                    />
                ) : (
                    <StatusIcon status={status} />
                )}
            </div>
        </td>
    )
}