import {Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount} from "@shared/ui";
import {cn} from "@shared/lib";
import type {Event} from "@entities/event";

export type SchoolEvent = Event;

export const WEEK_COUNT = 7

export interface GanttItem {
    event: SchoolEvent
    startCol: number
    span: number
    row: number
}

export const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function buildGanttItems(events: SchoolEvent[], windowStart: Date): GanttItem[] {
    const windowEnd = new Date(windowStart.getTime() + WEEK_COUNT * MS_PER_WEEK)

    const visible = events.filter((e) => {
        const start = new Date(e.startDate)
        const end = new Date(e.endDate)
        return start < windowEnd && end > windowStart
    })

    const items: GanttItem[] = visible.map((e) => {
        const start = new Date(e.startDate)
        const end = new Date(e.endDate)
        const startCol = Math.max(
            0,
            Math.floor((start.getTime() - windowStart.getTime()) / MS_PER_WEEK)
        )
        const endCol = Math.min(
            WEEK_COUNT,
            Math.max(
                startCol + 1,
                Math.ceil((end.getTime() - windowStart.getTime()) / MS_PER_WEEK)
            )
        )
        return { event: e, startCol, span: endCol - startCol, row: 0 }
    })

    const rows: Array<[number, number][]> = []
    items.forEach((item) => {
        const itemEnd = item.startCol + item.span
        let rowIndex = rows.findIndex(
            (row) => !row.some(([s, e]) => !(itemEnd <= s || item.startCol >= e))
        )
        if (rowIndex === -1) {
            rowIndex = rows.length
            rows.push([])
        }
        rows[rowIndex].push([item.startCol, itemEnd])
        item.row = rowIndex + 1
    })

    return items
}

export const avatarBg = [
    "bg-pink-400",
    "bg-sky-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-violet-400",
]

export function AvatarStack({ seed }: { seed: string }) {
    const count = (seed.charCodeAt(0) % 3) + 2
    const extra = (seed.charCodeAt(1) % 12) + 5
    return (
        <AvatarGroup>
            {Array.from({ length: count }).map((_, i) => (
                <Avatar key={i} size="sm">
                    <AvatarFallback
                        className={cn("text-white text-xs font-semibold", avatarBg[i])}
                    >
                        {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                </Avatar>
            ))}
            <AvatarGroupCount className="text-xs">+{extra}</AvatarGroupCount>
        </AvatarGroup>
    )
}
