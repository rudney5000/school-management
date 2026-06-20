import { StatusIcon } from './StatusIcon'
import type { AttendanceStatus } from '@entities/attendances'

const FULL_CYCLE: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

interface StatusToggleProps {
    status?: AttendanceStatus
    onChange: (status: AttendanceStatus) => void
    allowedStatuses?: AttendanceStatus[]
}

export function StatusToggle({ status, onChange, allowedStatuses }: StatusToggleProps) {
    const cycle = allowedStatuses ?? FULL_CYCLE
    const current = status && cycle.includes(status) ? status : cycle[0]

    const handleClick = () => {
        const idx = cycle.indexOf(current)
        const next = cycle[(idx + 1) % cycle.length]
        onChange(next)
    }

    return (
        <button
            onClick={handleClick}
            className="rounded-full p-1 hover:bg-muted transition-colors cursor-pointer"
            title={`Statut: ${current} — cliquer pour changer`}
        >
            <StatusIcon status={current} />
        </button>
    )
}