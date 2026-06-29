import {
    Inbox,
    Star,
    Send,
    FileText,
    AlertCircle,
    Trash2,
    Plus
} from 'lucide-react'
import {
    Badge,
    Separator
} from '@shared/ui'
import { cn } from '@shared/lib'

const labels = [
    { id: 'academic',       label: 'Academic',       color: 'bg-pink-400',  count: 3 },
    { id: 'events',         label: 'Events',         color: 'bg-slate-800', count: 2 },
    { id: 'finance',        label: 'Finance',        color: 'bg-cyan-400',  count: 1 },
    { id: 'administration', label: 'Administration', color: 'bg-slate-400', count: 2 },
]

interface ChatSidebarProps {
    selectedCategory: string
    onSelectCategory: (id: string) => void
    counts: {
        all: number
        starred: number
        unread: number
        groups: number
        direct: number
        archived: number
    }
}

export function ChatSidebar({
                                selectedCategory,
                                onSelectCategory,
                                counts
}: ChatSidebarProps) {
    const categories = [
        { id: 'all',      label: 'All Chats',       icon: Inbox,       count: counts.all },
        { id: 'starred',  label: 'Starred',          icon: Star,        count: counts.starred },
        { id: 'unread',   label: 'Unread',           icon: Send,        count: counts.unread },
        { id: 'groups',   label: 'Groups',           icon: FileText,    count: counts.groups },
        { id: 'direct',   label: 'Direct Messages',  icon: AlertCircle, count: counts.direct },
        { id: 'archived', label: 'Archived',         icon: Trash2,      count: counts.archived },
    ]

    return (
        <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-card px-3 py-5">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Category
            </p>
            <nav className="flex flex-col gap-0.5">
                {categories.map(({ id, label, icon: Icon, count }) => (
                    <button
                        key={id}
                        onClick={() => onSelectCategory(id)}
                        className={cn(
                            'flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors',
                            selectedCategory === id
                                ? 'bg-accent font-semibold text-primary'
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {label}
                        </span>
                        {count > 0 && (
                            <Badge
                                variant={selectedCategory === id ? 'default' : 'secondary'}
                                className="text-xs px-1.5 py-0.5"
                            >
                                {count}
                            </Badge>
                        )}
                    </button>
                ))}
            </nav>

            <Separator className="my-4" />

            <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Label</p>
                <button className="text-muted-foreground hover:text-foreground">
                    <Plus className="size-3.5" />
                </button>
            </div>
            <nav className="flex flex-col gap-0.5">
                {labels.map(({ id, label, color, count }) => (
                    <button
                        key={id}
                        className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    >
                        <span className="flex items-center gap-2">
                            <span className={cn('size-2.5 rounded-full', color)} />
                            {label}
                        </span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </button>
                ))}
            </nav>
        </aside>
    )
}