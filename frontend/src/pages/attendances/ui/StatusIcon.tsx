import { CheckCircle2, XCircle, Minus } from "lucide-react"
import type { AttendanceStatus } from "@entities/attendances/model/types"

interface StatusIconProps {
    status: AttendanceStatus | undefined
}

export function StatusIcon({ status }: StatusIconProps) {
    if (status === "PRESENT")
        return <CheckCircle2 className="size-5 text-emerald-500" />
    if (status === "ABSENT")
        return <XCircle className="size-5 text-red-500" />
    if (status === "LATE")
        return <CheckCircle2 className="size-5 text-amber-500" />
    return <Minus className="size-4 text-muted-foreground" />
}
