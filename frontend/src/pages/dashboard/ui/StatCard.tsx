import {AlertCircle, Minus, TrendingDown, TrendingUp} from "lucide-react";
import {Card, CardContent} from "@shared/ui/card.tsx";
import {cn} from "@shared/lib/utils.ts";

type StatCardProps = {
    value: string
    label: string
    sub?: string
    trend?: 'up' | 'down' | 'stable' | 'warning'
    trendLabel?: string
    highlight?: boolean
    alert?: boolean
}

export function StatCard({ value, label, sub, trend, trendLabel, highlight, alert }: StatCardProps) {
    const TrendIcon =
        trend === 'up' ? TrendingUp :
            trend === 'down' ? TrendingDown :
                trend === 'stable' ? Minus :
                    trend === 'warning' ? AlertCircle : null

    const trendColor =
        trend === 'up' ? 'text-emerald-500' :
            trend === 'down' ? 'text-red-500' :
                trend === 'stable' ? 'text-blue-500' :
                    trend === 'warning' ? 'text-red-500' : ''

    return (
        <Card className={cn('relative overflow-hidden', alert && 'ring-1 ring-red-200 bg-red-50/40')}>
            <CardContent className="pt-5 pb-4 px-5">
                {trendLabel && TrendIcon && (
                    <div className={cn('flex items-center gap-1 text-xs font-medium mb-2', trendColor)}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{trendLabel}</span>
                    </div>
                )}
                <div className="text-3xl font-bold text-zinc-900 leading-none mb-1">{value}</div>
                <div className="text-sm font-medium text-zinc-700">{label}</div>
                {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
                {highlight && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
            </CardContent>
        </Card>
    )
}