import { useRouterState } from '@tanstack/react-router'
import { cn } from '@shared/lib/utils'
import { navByRole, type NavGroup } from './nav-items'
import { School } from 'lucide-react'
import { useTranslation } from '@shared/lib/useTranslation'
import type { UserRole } from '@features/auth/model/dto/RegisterDto'
import { getInitials } from '@shared/lib/getInitial'
import { LocaleLink } from '@shared/ui'

type SidebarProps = {
    role?: UserRole
    userName?: string
    userEmail?: string
    liveClass?: {
        code: string
        name: string
        room: string
    } | null
    stats?: {
        classes: number
        students: number
        term: string
    }
}

export function Sidebar({
    role = 'admin',
    userName = 'Admin',
    userEmail,
    liveClass,
    stats,
}: SidebarProps) {
    const { t, locale } = useTranslation()
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname

    const groups: NavGroup[] = navByRole[role]

    return (
        <aside className="flex flex-col w-[260px] shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[#1755EC] to-[#4F46E5]">
            <div className="flex items-center gap-3 px-5 h-16 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm">
                    <School className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-[15px] font-bold tracking-tight text-white truncate">
                        EduPulse
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                        School Management
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
                {groups.map((group) => (
                    <div key={group.groupKey}>
                        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                            {t(group.groupKey)}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const fullPath = `/${locale}${item.path}`
                                const isActive =
                                    currentPath === fullPath ||
                                    currentPath.startsWith(fullPath + '/')
                                const Icon = item.icon

                                return (
                                    <li key={item.path}>
                                        <LocaleLink
                                            to={item.path}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group',
                                                isActive
                                                    ? 'bg-white text-[#1755EC] font-semibold shadow-sm'
                                                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'w-[18px] h-[18px] shrink-0 transition-colors',
                                                    isActive
                                                        ? 'text-[#1755EC]'
                                                        : 'text-white/60 group-hover:text-white'
                                                )}
                                            />
                                            <span className="flex-1 truncate">{t(item.labelKey)}</span>

                                            {item.badge && (
                                                <span
                                                    className={cn(
                                                        'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold',
                                                        isActive
                                                            ? 'bg-[#1755EC]/10 text-[#1755EC]'
                                                            : 'bg-white/20 text-white'
                                                    )}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </LocaleLink>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {liveClass && (
                <div className="shrink-0 mx-3 mb-2 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[11px] font-semibold text-white">
                            {liveClass.code} · Period 3 · Live
                        </span>
                    </div>
                    <p className="text-[10px] text-white/60 truncate">
                        {liveClass.name} · {liveClass.room}
                    </p>
                </div>
            )}

            <div className="shrink-0 mx-3 mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/20">
                        <span className="text-[12px] font-semibold text-white">
                            {getInitials(userName)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
                        {userEmail && (
                            <p className="text-[11px] text-white/50 truncate">{userEmail}</p>
                        )}
                    </div>
                </div>
                {stats && (
                    <div className="grid grid-cols-3 divide-x divide-white/15 mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[14px] font-bold text-white">{stats.classes}</span>
                            <span className="text-[9px] text-white/50 uppercase tracking-wide">Classes</span>
                        </div>
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[14px] font-bold text-white">{stats.students}</span>
                            <span className="text-[9px] text-white/50 uppercase tracking-wide">Students</span>
                        </div>
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[14px] font-bold text-white">{stats.term}</span>
                            <span className="text-[9px] text-white/50 uppercase tracking-wide">Term</span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}
