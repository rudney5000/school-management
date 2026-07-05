import {
    useState,
    useMemo
} from 'react'
import {
    Search,
    Forward,
    X
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    Button,
    Input,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@shared/ui'
import { cn } from '@shared/lib'
import { useAppSelector } from '@shared/store/hooks'
import { selectConversations } from '@entities/chat'
import type { Message } from '@entities/chat'
import { useTranslation } from '@shared/lib'

interface ForwardDialogProps {
    message: Message
    onForward: (targetConversationId: string) => void
    onClose: () => void
}

export function ForwardDialog({ message, onForward, onClose }: ForwardDialogProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isForwarding, setIsForwarding] = useState(false)

    const conversations = useAppSelector(selectConversations)

    const filtered = useMemo(() =>
            conversations.filter(c =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.members.some(m => m.user.email?.toLowerCase().includes(search.toLowerCase()))
            ),
        [conversations, search]
    )

    const handleForward = async () => {
        if (!selectedId) return
        setIsForwarding(true)
        try {
            onForward(selectedId)
            onClose()
        } finally {
            setIsForwarding(false)
        }
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-base font-semibold">
                                {t('dashboard.chat.forwardMessage')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {t('dashboard.chat.selectConversationForward')}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={onClose}>
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="mx-4 mt-4 rounded-xl border border-border bg-muted/50 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('dashboard.chat.forwarding')}</p>
                    <p className="text-sm text-foreground line-clamp-2">
                        {message.isDeleted
                            ? <span className="italic text-muted-foreground">{t('dashboard.chat.messageDeleted')}</span>
                            : message.content
                        }
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {t('dashboard.chat.from')} {message.sender.email?.split('@')[0]} ·{' '}
                        {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="px-4 pt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder={t('dashboard.chat.searchConversations')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 rounded-full bg-muted border-transparent"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="mx-4 mt-3 max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                    {filtered.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {t('dashboard.chat.noConversationsFound')}
                        </div>
                    )}
                    {filtered.map((conv) => {
                        const initials = conv.name
                            ? conv.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : '??'
                        const isSelected = selectedId === conv.id
                        const typeLabel = {
                            dm: t('dashboard.chat.types.dm'),
                            group: t('dashboard.chat.types.group'),
                            class: t('dashboard.chat.types.class'),
                            course: t('dashboard.chat.types.course'),
                        }[conv.type]

                        return (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedId(isSelected ? null : conv.id)}
                                className={cn(
                                    'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
                                    isSelected
                                        ? 'bg-primary/10'
                                        : 'hover:bg-muted/60'
                                )}
                            >
                                <Avatar className="shrink-0">
                                    <AvatarFallback className={cn(
                                        'text-xs font-semibold',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {conv.name || t('dashboard.chat.unnamedChat')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {typeLabel} · {conv.members.length} {t('dashboard.chat.members')}
                                    </p>
                                </div>

                                {isSelected && (
                                    <div className="size-5 shrink-0 rounded-full bg-primary flex items-center justify-center">
                                        <svg className="size-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-t border-border mt-3">
                    <p className="text-xs text-muted-foreground">
                        {selectedId
                            ? t('dashboard.chat.conversationSelected')
                            : t('dashboard.chat.selectConversation')}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            className="gap-1.5 rounded-full px-4"
                            disabled={!selectedId || isForwarding}
                            onClick={handleForward}
                        >
                            <Forward className="size-3.5" />
                            {isForwarding ? t('dashboard.chat.forwardingInProgress') : t('dashboard.chat.forward')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}