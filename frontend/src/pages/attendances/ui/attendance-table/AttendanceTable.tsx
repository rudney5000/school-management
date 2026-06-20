import { useMemo } from "react"
import type { AppDispatch } from "@shared/store"
import { useAppSelector } from "@shared/store/hooks"
import {
    markPendingAttendance,
    setActiveTab,
    setEditingDate
} from "@entities/attendances/model/slice"
import { selectAttendancePermission } from "@features/auth/model/selectors"
import { type AttendanceStatus, selectEditingDate } from "@entities/attendances"
import type { Class } from "@entities/class"
import { AttendanceTableHeader } from "./AttendanceTableHeader"
import { AttendanceTableSkeleton } from "./AttendanceTableSkeleton"
import { AttendanceRow } from "./AttendanceRow"
import { AttendanceDayHeaderCell } from "./AttendanceDayHeaderCell"
import { AttendanceTablePagination } from "./AttendanceTablePagination"
import {formatDateKey} from "@/pages/attendances/lib/dateUtils";
import {useTranslation} from "@shared/lib";

interface AttendanceTableProps {
    activeTab: string
    classes: Class[]
    selectedClass: string
    setSelectedClass: (value: string) => void
    selectedMonth: string
    setSelectedMonth: (value: string) => void
    workdays: Date[]
    loading: boolean
    pagedTabData: Array<{ id: string; name: string; type: string }>
    attendanceMap: Map<string, AttendanceStatus>
    tabData: Array<{ id: string; name: string; type: string }>
    page: number
    setPage: (page: number) => void
    totalPages: number
    accent: string
    dispatch: AppDispatch
    monthOptions: string[]
}

export function AttendanceTable({
                                    activeTab,
                                    classes,
                                    selectedClass,
                                    setSelectedClass,
                                    selectedMonth,
                                    setSelectedMonth,
                                    workdays,
                                    loading,
                                    pagedTabData,
                                    attendanceMap,
                                    tabData,
                                    page,
                                    setPage,
                                    totalPages,
                                    accent,
                                    dispatch,
                                    monthOptions
}: AttendanceTableProps) {
    const { t } = useTranslation()
    const { canEdit } = useAppSelector(selectAttendancePermission)
    const editingDate = useAppSelector(selectEditingDate)
    const pendingChanges = useAppSelector(state => state.attendance.pendingChanges)

    const resolvedMap = useMemo(() => {
        const merged = new Map(attendanceMap)
        pendingChanges.forEach(change => {
            merged.set(`${change.personId}__${change.date}`, change.status)
        })
        return merged
    }, [attendanceMap, pendingChanges])

    const handleStatusChange = (personId: string, date: string, status: AttendanceStatus) => {
        dispatch(markPendingAttendance({ personId, date, status }))
    }

    const handleToggleEdit = (dateKey: string) => {
        dispatch(setEditingDate(editingDate === dateKey ? null : dateKey))
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" style={{ boxShadow: `0 4px 24px 0 ${accent}18` }}>
            <AttendanceTableHeader
                activeTab={activeTab}
                onTabChange={(tab) => dispatch(setActiveTab(tab))}
                classes={classes}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                monthOptions={monthOptions}
            />

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="sticky left-0 bg-muted/40 text-left px-3 sm:px-5 py-3 font-medium text-muted-foreground text-xs w-[150px] sm:w-[200px]">
                            {t(`dashboard.attendance.table.columns.${activeTab}`)}
                        </th>
                        {workdays.map((day) => (
                            <AttendanceDayHeaderCell
                                key={formatDateKey(day)}
                                day={day}
                                canEdit={canEdit}
                                editingDate={editingDate}
                                onToggleEdit={handleToggleEdit}
                            />
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <AttendanceTableSkeleton workdays={workdays} />
                    ) : (
                        pagedTabData.map((item) => (
                            <AttendanceRow
                                key={item.id}
                                item={item}
                                workdays={workdays}
                                resolvedMap={resolvedMap}
                                canEdit={canEdit}
                                editingDate={editingDate}
                                onStatusChange={handleStatusChange}
                            />
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <AttendanceTablePagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                totalResults={tabData.length}
                accent={accent}
            />
        </div>
    )
}