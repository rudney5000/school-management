import {
    Search,
    SlidersHorizontal,
    Settings,
    Menu
} from 'lucide-react'
import {
    Button,
    Input
} from '@shared/ui'
import { useTranslation } from '@shared/lib'

interface ChatHeaderProps {
    onToggleSidebar?: () => void
    isSidebarOpen?: boolean
}

export function ChatHeader({ onToggleSidebar, isSidebarOpen = false }: ChatHeaderProps) {
    const { t } = useTranslation()
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-3">
                <Button
                    onClick={onToggleSidebar}
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl h-9 w-9"
                >
                    {isSidebarOpen ? (
                        <Search className="size-5" />
                    ) : (
                        <Menu className="size-5" />
                    )}
                </Button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.chat.title')}</h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative hidden md:flex w-72 items-center">
                    <Search className="absolute left-3 size-4 text-muted-foreground" />
                    <Input
                        placeholder={t('dashboard.chat.searchAnything')}
                        className="rounded-full pl-9 pr-4 text-sm bg-muted/50 border-transparent focus:border-border"
                    />
                    <Button variant="ghost" size="icon-sm" className="absolute right-2 text-muted-foreground">
                        <SlidersHorizontal className="size-4" />
                    </Button>
                </div>
                <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground">
                    <Settings className="size-4" />
                </Button>
            </div>
        </header>
    )
}