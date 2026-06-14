import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@shared/lib/utils'

export type StatCardItem = {
    label: string
    value: number | string
    icon: LucideIcon
    trend?: {
        value: string
        positive?: boolean
    }
}

type StatCardsRowProps = {
    stats: StatCardItem[]
}

export function StatCardsRow({ stats }: StatCardsRowProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                const isPositive = stat.trend?.positive ?? true

                return (
                    <div
                        key={stat.label}
                        className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] border border-zinc-100/80 transition-shadow hover:shadow-[0_4px_16px_rgba(23,85,236,0.08)]"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1755EC]/10 shrink-0">
                                <Icon className="h-5 w-5 text-[#1755EC]" />
                            </div>
                            {stat.trend && (
                                <div
                                    className={cn(
                                        'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5',
                                        isPositive
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-rose-600 bg-rose-50'
                                    )}
                                >
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {stat.trend.value}
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-2xl font-bold text-zinc-900 tracking-tight">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
                    </div>
                )
            })}
        </div>
    )
}
