import { CheckCircle2, Radio } from 'lucide-react'

type ScheduleBadgeProps = {
    status: string
}

export function ScheduleBadge({ status }: ScheduleBadgeProps) {
    if (status === 'live') return (
        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <Radio className="h-3 w-3 animate-pulse" /> Live
        </span>
    )
    if (status === 'done') return (
        <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Done
        </span>
    )
    if (status === 'next') return (
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Next</span>
    )
    return (
        <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Upcoming</span>
    )
}