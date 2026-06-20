import {formatDateKey} from "@/pages/attendances/lib/dateUtils.ts";

interface AttendanceTableSkeletonProps {
    workdays: Date[]
    rows?: number
}

export function AttendanceTableSkeleton({
                                            workdays,
                                            rows = 5
}: AttendanceTableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                    <td className="px-3 sm:px-5 py-3">
                        <div className="h-4 w-32 sm:w-40 bg-muted animate-pulse rounded" />
                    </td>
                    {workdays.map((d) => (
                        <td key={formatDateKey(d)} className="px-2 py-3 text-center">
                            <div className="h-5 w-5 bg-muted animate-pulse rounded-full mx-auto" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}