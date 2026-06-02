import { Bell, Calendar, ChevronDown, Search, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '@features/change-language'
import { cn } from '@shared/lib/utils'
import { useTranslation } from '@shared/lib/useTranslation.ts'

type HeaderProps = {
    greeting?: string
    weekInfo?: string
    liveClass?: {
        code: string
        label?: string
    } | null
    notificationCount?: number
    userName?: string
    userDepartment?: string
    userInitials?: string
}

export function Header({
                           greeting,
                           weekInfo,
                           liveClass,
                           notificationCount = 0,
                           userName = 'Admin',
                           userDepartment,
                           userInitials,
                       }: HeaderProps) {
    const { t } = useTranslation()
    const [dark, setDark] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)

    const today = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date())

    const initials =
        userInitials ||
        userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

    const getGreeting = () => {
        if (greeting) return greeting
        const hour = new Date().getHours()
        if (hour < 12) return `Good morning, ${userName} 👋`
        if (hour < 18) return `Good afternoon, ${userName} 👋`
        return `Good evening, ${userName} 👋`
    }

    return (
        <header className="
            sticky top-0 z-20
            flex items-center justify-between
            h-16 px-6
            bg-white
            border-b border-zinc-100
        ">
            {/* Left — greeting + date */}
            <div className="flex flex-col justify-center min-w-0">
                {weekInfo && (
                    <p className="text-[11px] text-zinc-400 mb-0.5">{weekInfo}</p>
                )}
                {!weekInfo && (
                    <p className="text-[11px] text-zinc-400 mb-0.5 capitalize">{today}</p>
                )}
                <h1 className="text-[17px] font-bold text-zinc-900 leading-tight truncate">
                    {getGreeting()}
                </h1>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {/* Search */}
                <div
                    className={cn(
                        'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-all duration-150 cursor-text',
                        searchFocused
                            ? 'bg-white border border-indigo-300 ring-2 ring-indigo-100 w-52'
                            : 'bg-zinc-50 border border-zinc-200 text-zinc-400 w-44 hover:border-zinc-300'
                    )}
                    onClick={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    tabIndex={0}
                >
                    <Search className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span className="text-zinc-400">
                        {t('header.search') || 'Search students, assignments, grades…'}
                    </span>
                    <kbd className="ml-auto text-[10px] text-zinc-300 border border-zinc-200 rounded px-1 hidden lg:block">
                        ⌘K
                    </kbd>
                </div>

                {/* Live class badge */}
                {liveClass && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        <span className="text-[12px] font-semibold text-indigo-700">
                            {liveClass.code} · {liveClass.label || 'Live Now'}
                        </span>
                    </div>
                )}

                {/* Language switcher */}
                <LanguageSwitcher />

                {/* Dark mode toggle */}
                <button
                    onClick={() => setDark(!dark)}
                    className="
                        w-8 h-8 rounded-lg flex items-center justify-center
                        border border-zinc-200 text-zinc-400
                        hover:bg-zinc-50 hover:text-zinc-600
                        transition-colors
                    "
                    aria-label="Toggle theme"
                >
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Calendar */}
                <button
                    className="
                        w-8 h-8 rounded-lg flex items-center justify-center
                        border border-zinc-200 text-zinc-400
                        hover:bg-zinc-50 hover:text-zinc-600
                        transition-colors
                    "
                    aria-label="Calendar"
                >
                    <Calendar className="w-4 h-4" />
                </button>

                {/* Notifications */}
                <button
                    className="
                        relative w-8 h-8 rounded-lg flex items-center justify-center
                        border border-zinc-200 text-zinc-400
                        hover:bg-zinc-50 hover:text-zinc-600
                        transition-colors
                    "
                    aria-label={t('header.notifications') || 'Notifications'}
                >
                    <Bell className="w-4 h-4" />
                    {notificationCount > 0 && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                </button>

                {/* User avatar */}
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-zinc-50 transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-semibold text-white">{initials}</span>
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-none">
                        <p className="text-[12px] font-semibold text-zinc-900">{userName}</p>
                        {userDepartment && (
                            <p className="text-[10px] text-zinc-400">{userDepartment}</p>
                        )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 hidden lg:block" />
                </button>
            </div>
        </header>
    )
}