import { AttendanceCell } from "./AttendanceCell"
import type { AttendanceStatus } from "@entities/attendances"
import {formatDateKey} from "@/pages/attendances/lib/dateUtils.ts";

interface AttendanceRowProps {
    item: { id: string; name: string; type: string }
    workdays: Date[]
    resolvedMap: Map<string, AttendanceStatus>
    canEdit: boolean
    editingDate: string | null
    onStatusChange: (personId: string, date: string, status: AttendanceStatus) => void
}

export function AttendanceRow({
                                  item,
                                  workdays,
                                  resolvedMap,
                                  canEdit,
                                  editingDate,
                                  onStatusChange
}: AttendanceRowProps) {
    return (
        <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <td className="sticky left-0 bg-background px-3 sm:px-5 py-3 font-medium text-foreground whitespace-nowrap">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                    <span className="text-muted-foreground text-[10px] sm:text-xs">{item.id.slice(0, 8)}…</span>
                    <span className="text-xs sm:text-sm">{item.name}</span>
                </div>
            </td>
            {workdays.map((day) => {
                const dateKey = formatDateKey(day)
                const status = resolvedMap.get(`${item.id}__${dateKey}`)
                return (
                    <AttendanceCell
                        key={dateKey}
                        day={day}
                        status={status}
                        canEdit={canEdit}
                        editingDate={editingDate}
                        onChange={(date, newStatus) => onStatusChange(item.id, date, newStatus)}
                    />
                )
            })}
        </tr>
    )
}