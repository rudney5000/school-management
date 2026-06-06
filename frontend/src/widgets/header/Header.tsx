import { Bell, Calendar, Search } from 'lucide-react'
import { useTranslation } from '@/shared/lib/useTranslation'
import { Button, Input } from '@/shared/ui'
import { LanguageSwitcher } from '@/features/change-language'
import { SchoolSwitcher } from '@/features/school/school-switcher/ui/SchoolSwitcher'
import { UserNav } from '@/features/user/user-menu/ui/UserNav'
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle'

export function Header() {
    const { t } = useTranslation()

    const today = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date())

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return t('greeting.morning')
        if (hour < 18) return t('greeting.afternoon')
        return t('greeting.evening')
    }

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-background border-b border-border shadow-sm">
            <div className="flex items-center gap-4">
                <SchoolSwitcher />

                <div className="flex flex-col justify-center min-w-0">
                    <p className="text-[11px] text-muted-foreground mb-0.5 capitalize">{today}</p>
                    <h1 className="text-[17px] font-bold text-foreground leading-tight truncate">
                        {getGreeting()} 👋
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">

                <div className="hidden md:flex relative w-44 lg:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                        type="search"
                        placeholder={t('header.search')}
                        className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                    />
                    <kbd className="absolute right-2 top-2.5 hidden lg:flex h-5 items-center gap-1 rounded border bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>

                <LanguageSwitcher />
                <ThemeToggle />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                    aria-label={t('header.calendar')}
                >
                    <Calendar className="h-4 w-4" />
                </Button>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                        aria-label={t('header.notifications')}
                    >
                        <Bell className="h-4 w-4" />
                    </Button>
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>

                <UserNav />
            </div>
        </header>
    )
}