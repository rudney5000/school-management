import { useRouterState } from '@tanstack/react-router'
import { cn } from '@shared/lib/utils'
import { navByRole, type NavGroup } from './nav-items'
import {ChevronLeft, School, X, LogOut} from 'lucide-react'
import { useTranslation } from '@shared/lib/useTranslation'
import type { UserRole } from '@features/auth/model/dto/RegisterDto'
import { getInitials } from '@shared/lib/getInitial'
import {
    LocaleLink,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Button
} from '@shared/ui'
import { useAppDispatch } from '@/shared/store/hooks'
import {logout} from "@features/auth/store/auth-slice";
import {useLocaleRoute} from "@shared/lib";

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
    collapsed?: boolean
    onToggle?: () => void
    isMobile?: boolean
}

export function Sidebar({
                            role = 'admin',
                            userName = 'Admin',
                            userEmail,
                            liveClass,
                            stats,
                            collapsed = false,
                            onToggle,
                            isMobile = false,
                        }: SidebarProps) {
    const { t, locale } = useTranslation()
    const routerState = useRouterState()
    const currentPath = routerState.location.pathname
    const dispatch = useAppDispatch()
    const { localeRoute } = useLocaleRoute()

    const handleLogout = () => {
        localStorage.clear()
        dispatch(logout())
        const loginRoute = localeRoute('/login')
        window.location.href = loginRoute.to
    }

    const groups: NavGroup[] = navByRole[role]

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'flex flex-col shrink-0 h-screen bg-gradient-to-b from-[#1755EC] to-[#4F46E5]',
                    'transition-[width,transform] duration-200 ease-in-out overflow-hidden',
                    'z-30',
                    isMobile
                        ? cn(
                            'fixed inset-y-0 left-0 w-[260px]',
                            collapsed ? '-translate-x-full' : 'translate-x-0'
                        )
                        : cn(
                            'sticky top-0 lg:relative',
                            collapsed ? 'w-[64px]' : 'w-[260px]'
                        )
                )}
            >
                <div className="relative flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm">
                        <School className="w-5 h-5 text-white" />
                    </div>

                    <div
                        className={cn(
                            'flex flex-col leading-tight min-w-0 transition-[opacity,width] duration-200',
                            collapsed ? 'opacity-0 w-0' : 'opacity-100'
                        )}
                    >

                        <LocaleLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <span className="text-[15px] font-bold tracking-tight text-white truncate">
                                SchoolHub
                            </span>
                        </LocaleLink>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                            {t('dashboard.tagline')}
                        </span>
                    </div>

                    {isMobile ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggle}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-[#1755EC] border border-white/30 text-white hover:bg-[#1245cc]"
                            aria-label={t('dashboard.aria.close')}
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    ) : (
                        <button
                            onClick={onToggle}
                            className={cn(
                                'absolute right-1 top-1/2 -translate-y-1/2 z-10',
                                'w-6 h-6 rounded-full bg-[#1755EC] border border-white/30',
                                'flex items-center justify-center',
                                'hover:bg-[#1245cc] transition-colors'
                            )}
                            aria-label={collapsed ? t('dashboard.aria.expand') : t('dashboard.aria.collapse')}
                        >
                            <ChevronLeft
                                className={cn(
                                    'w-3.5 h-3.5 text-white transition-transform duration-250',
                                    collapsed && 'rotate-180'
                                )}
                            />
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-5 scrollbar-thin">
                    {groups.map((group) => (
                        <div key={group.groupKey}>
                            <p
                                className={cn(
                                    'px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40',
                                    'transition-[opacity] duration-200',
                                    collapsed && 'opacity-0'
                                )}
                            >
                                {t(group.groupKey)}
                            </p>
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const fullPath = `/${locale}${item.path}`
                                    const isActive =
                                        currentPath === fullPath ||
                                        currentPath.startsWith(fullPath + '/')
                                    const Icon = item.icon

                                    const linkContent = (
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
                                                    isActive ? 'text-[#1755EC]' : 'text-white/60 group-hover:text-white'
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    'flex-1 truncate transition-[opacity,width] duration-200',
                                                    collapsed ? 'opacity-0 w-0' : 'opacity-100'
                                                )}
                                            >
                                    {t(item.labelKey)}
                                </span>
                                            {item.badge && !collapsed && (
                                                <span
                                                    className={cn(
                                                        'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold',
                                                        isActive ? 'bg-[#1755EC]/10 text-[#1755EC]' : 'bg-white/20 text-white'
                                                    )}
                                                >
                                        {item.badge}
                                    </span>
                                            )}
                                        </LocaleLink>
                                    )

                                    return (
                                        <li key={item.path}>
                                            {collapsed ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="block">{linkContent}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="right"
                                                        className="bg-[#1755EC] text-white border-none shadow-lg"
                                                    >
                                                        {t(item.labelKey)}
                                                        {item.badge && (
                                                            <span className="ml-1.5 text-xs opacity-70">
                                                    {item.badge}
                                                </span>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                linkContent
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {liveClass && (
                    <div
                        className="shrink-0 mx-2.5 mb-2 px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block mx-auto"/>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {liveClass.code} · {t('dashboard.live')}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"/>
                                    <span className="text-[11px] font-semibold text-white">
                                        {liveClass.code} · {t('dashboard.period', { number: 3 })} · {t('dashboard.live')}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/60 truncate">
                                    {liveClass.name} · {liveClass.room}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <div
                    className="shrink-0 mx-2.5 mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/20 cursor-default">
                                    <span className="text-[12px] font-semibold text-white">
                                        {getInitials(userName)}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right">
                                    <p className="font-medium">{userName}</p>
                                    {userEmail && (
                                        <p className="text-xs opacity-70">{userEmail}</p>
                                    )}
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <div
                            className={cn(
                                'flex-1 min-w-0 transition-[opacity,width] duration-200',
                                collapsed ? 'opacity-0 w-0' : 'opacity-100'
                            )}
                        >
                            <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
                            {userEmail && (
                                <p className="text-[11px] text-white/50 truncate">{userEmail}</p>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={cn(
                                'shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20',
                                'flex items-center justify-center transition-colors',
                                'text-white/70 hover:text-white',
                                collapsed ? 'hidden' : 'flex'
                            )}
                            aria-label={t('user.logout')}
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    {stats && !collapsed && (
                        <div className="grid grid-cols-3 divide-x divide-white/15 mt-3 pt-3 border-t border-white/10">
                            <div className="flex flex-col items-center px-1">
                                <span className="text-[14px] font-bold text-white">
                                    {stats.classes}
                                </span>
                                <span className="text-[9px] text-white/50 uppercase tracking-wide">
                                    {t('dashboard.stats.classes')}
                                </span>
                            </div>
                            <div className="flex flex-col items-center px-1">
                                <span className="text-[14px] font-bold text-white">
                                    {stats.students}
                                </span>
                                <span className="text-[9px] text-white/50 uppercase tracking-wide">
                                    {t('dashboard.stats.students')}
                                </span>
                            </div>
                            <div className="flex flex-col items-center px-1">
                                <span className="text-[14px] font-bold text-white">
                                    {stats.term}
                                </span>
                                <span className="text-[9px] text-white/50 uppercase tracking-wide">
                                    {t('dashboard.stats.term')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    )
}
