import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@shared/lib/utils'
import { navByRole, type NavGroup } from './nav-items'
import { School } from 'lucide-react'
import { useTranslation } from '@shared/lib/useTranslation.ts'
import type { UserRole } from '@features/auth/model/dto/RegisterDto.ts'
import {getInitials} from "@shared/lib/getInitial";

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
        <aside className="flex flex-col w-[220px] shrink-0 bg-white border-r border-zinc-100 h-screen sticky top-0">
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-100 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <School className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[14px] font-bold tracking-tight text-zinc-900">
                        EduPulse
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">
                        Learning Management
                    </span>
                </div>
            </div>

            <div className="mx-3 mt-3 rounded-xl bg-indigo-600 p-3 shrink-0">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-semibold text-white">{getInitials(userName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white truncate">{userName}</p>
                        {userEmail && (
                            <p className="text-[10px] text-indigo-200 truncate">{userEmail}</p>
                        )}
                    </div>
                </div>
                {stats && (
                    <div className="grid grid-cols-3 divide-x divide-white/20">
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[13px] font-bold text-white">{stats.classes}</span>
                            <span className="text-[9px] text-indigo-200 uppercase tracking-wide">Classes</span>
                        </div>
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[13px] font-bold text-white">{stats.students}</span>
                            <span className="text-[9px] text-indigo-200 uppercase tracking-wide">Students</span>
                        </div>
                        <div className="flex flex-col items-center px-1">
                            <span className="text-[13px] font-bold text-white">{stats.term}</span>
                            <span className="text-[9px] text-indigo-200 uppercase tracking-wide">Term</span>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
                {groups.map((group) => (
                    <div key={group.groupKey}>
                        <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                            {t(group.groupKey)}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const fullPath = `/${locale}${item.path}`
                                const isActive =
                                    currentPath === fullPath ||
                                    currentPath.startsWith(fullPath + '/')
                                const Icon = item.icon

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={fullPath}
                                            className={cn(
                                                'flex items-center gap-2.5 px-2 py-[7px] rounded-lg text-[13px] transition-all duration-150 group',
                                                isActive
                                                    ? 'bg-indigo-600 text-white font-medium'
                                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'w-4 h-4 shrink-0 transition-colors',
                                                    isActive
                                                        ? 'text-white'
                                                        : 'text-zinc-400 group-hover:text-zinc-600'
                                                )}
                                            />
                                            <span className="flex-1 truncate">{t(item.labelKey)}</span>

                                            {item.badge && (
                                                <span
                                                    className={cn(
                                                        'flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-indigo-50 text-indigo-600'
                                                    )}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {liveClass && (
                <div className="shrink-0 mx-3 mb-3 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        <span className="text-[11px] font-semibold text-indigo-700">
                            {liveClass.code} · Period 3 · Live
                        </span>
                    </div>
                    <p className="text-[10px] text-indigo-400 truncate">
                        {liveClass.name} · {liveClass.room}
                    </p>
                </div>
            )}
        </aside>
    )
}