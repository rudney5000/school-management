import { type LucideIcon } from 'lucide-react'
import { Card } from '@/shared/ui'

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    accent?: 'primary' | 'emerald' | 'amber' | 'blue'
    hint?: string
}

const accentMap = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
}

export function StatCard({ label, value, icon: Icon, accent = 'primary', hint }: StatCardProps) {
    const a = accentMap[accent]
    return (
        <Card className="group p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
                <div className={`flex size-10 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-1 ${a.ring} transition-transform group-hover:scale-110`}>
                    <Icon className="size-5" strokeWidth={2.2} />
                </div>
            </div>
        </Card>
    )
}
