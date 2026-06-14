import {
    BookOpen,
    CalendarCheck,
    GraduationCap,
    type LucideIcon,
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button
} from '@shared/ui'
import {
    cn,
    useTranslation,
    getInitials
} from '@shared/lib'

export type OverviewDetailItem = {
    label: string
    value: string
}

export type OverviewQuickAction = {
    icon: LucideIcon
    label: string
    onClick?: () => void
    href?: string
    colSpan?: number
}

export type OverviewBadge = {
    label: string
    variant: 'success' | 'danger' | 'warning' | 'neutral'
}

export type OverviewAcademicStats = {
    completionPercent: number
    completionLabel: string
    attendancePercent: number
    attendanceLabel: string
    attendancePeriodLabel: string
    bars?: number[]
}

type EntityOverviewPanelProps = {
    entity: {
        id: string
        firstName: string
        lastName: string
        image?: string | null
    } | null
    badge?: OverviewBadge
    details: OverviewDetailItem[]
    quickActions?: OverviewQuickAction[]
    academicStats?: OverviewAcademicStats
    emptyIcon?: LucideIcon
    emptyTitle?: string
    emptyDescription?: string
}

const badgeStyles: Record<OverviewBadge['variant'], string> = {
    success: 'bg-emerald-50 text-emerald-700',
    danger:  'bg-rose-50 text-rose-700',
    warning: 'bg-amber-50 text-amber-700',
    neutral: 'bg-zinc-100 text-zinc-500',
}

export function EntityOverviewPanel({
                                        entity,
                                        badge,
                                        details,
                                        quickActions,
                                        academicStats,
                                        emptyIcon: EmptyIcon = GraduationCap,
                                        emptyTitle,
                                        emptyDescription,
                                    }: EntityOverviewPanelProps) {
    const { t } = useTranslation()

    if (!entity) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[420px] rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1755EC]/8 mb-5">
                    <EmptyIcon className="h-10 w-10 text-[#1755EC]/60" />
                </div>
                {emptyTitle && (
                    <h3 className="text-base font-semibold text-zinc-900 mb-2">{emptyTitle}</h3>
                )}
                {emptyDescription && (
                    <p className="text-sm text-zinc-500 max-w-[220px] leading-relaxed">{emptyDescription}</p>
                )}
            </div>
        )
    }

    const fullName = `${entity.firstName} ${entity.lastName}`
    const image = entity.image ?? `https://i.pravatar.cc/150?u=${entity.id}`

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-5">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 ring-4 ring-[#1755EC]/10 mb-3">
                        <AvatarImage src={image} alt={fullName} />
                        <AvatarFallback className="bg-[#1755EC]/10 text-[#1755EC] text-lg font-semibold">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-zinc-900">{fullName}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5 font-mono truncate max-w-full">
                        ID: {entity.id.slice(0, 8)}…
                    </p>
                    {badge && (
                        <Badge className={cn('mt-3 rounded-full px-3 py-1 text-xs font-medium border-0', badgeStyles[badge.variant])}>
                            {badge.label}
                        </Badge>
                    )}
                </div>

                <div className="mt-5 space-y-3 border-t border-zinc-100 pt-4">
                    {details.map((item) => (
                        <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                            <span className="text-zinc-400 shrink-0">{item.label}</span>
                            <span className="text-zinc-700 font-medium text-right truncate">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {academicStats && (
                <>
                    <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="h-4 w-4 text-[#1755EC]" />
                            <h4 className="text-sm font-semibold text-zinc-900">{academicStats.completionLabel}</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                <span>{academicStats.completionLabel}</span>
                                <span className="font-medium text-[#1755EC]">{academicStats.completionPercent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#1755EC] to-[#4F46E5]"
                                    style={{ width: `${academicStats.completionPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarCheck className="h-4 w-4 text-[#1755EC]" />
                            <h4 className="text-sm font-semibold text-zinc-900">{academicStats.attendanceLabel}</h4>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{academicStats.attendancePercent}%</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{academicStats.attendancePeriodLabel}</p>
                            </div>
                            <div className="flex gap-1 items-end h-10">
                                {(academicStats.bars ?? [40, 65, 55, 80, 70, 92, 85]).map((h, i) => (
                                    <div key={i} className="w-2 rounded-sm bg-[#1755EC]/20" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {quickActions && quickActions.length > 0 && (
                <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">{t('dashboard.common.entityOverview.quickActions')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, i) => {
                            const Icon = action.icon
                            const cls = cn(
                                'rounded-xl h-9 flex-col gap-1 py-2 text-[10px] border-zinc-200 hover:bg-[#1755EC]/5 hover:text-[#1755EC] hover:border-[#1755EC]/20',
                                action.colSpan === 3 && 'col-span-3',
                                action.colSpan === 2 && 'col-span-2',
                            )
                            return action.href ? (
                                <Button key={i} variant="outline" size="sm" className={cls} asChild>
                                    <a href={action.href}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {action.label}
                                    </a>
                                </Button>
                            ) : (
                                <Button key={i} variant="outline" size="sm" className={cls} onClick={action.onClick}>
                                    <Icon className="h-3.5 w-3.5" />
                                    {action.label}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}