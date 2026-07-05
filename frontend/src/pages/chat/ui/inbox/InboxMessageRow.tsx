import { Star } from 'lucide-react'
import {
    Avatar,
    AvatarFallback
} from '@shared/ui'
import { cn } from '@shared/lib'
import type { Message } from '@entities/chat'
import { useTranslation } from '@shared/lib'

interface InboxMessageRowProps {
    message: Message
    isSelected: boolean
    currentUserId: string | null
    onClick: () => void
}

export function InboxMessageRow({
                                    message, isSelected, currentUserId, onClick
                                }: InboxMessageRowProps) {
    const { t } = useTranslation()
    const isOwn = message.senderId === currentUserId
    const senderLabel = message.sender.email?.split('@')[0] ?? '??'
    const initials = senderLabel.slice(0, 2).toUpperCase()
    const isRead = true

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-start gap-3 px-4 py-3 text-left transition-colors w-full',
                isSelected
                    ? 'bg-accent border-l-2 border-l-primary'
                    : 'hover:bg-muted/50',
                !isRead && 'bg-primary/5'
            )}
        >
            <Avatar className="mt-0.5 shrink-0">
                <AvatarFallback className={cn(
                    'text-xs font-semibold',
                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <span className={cn(
                        'truncate text-sm',
                        !isRead ? 'font-bold text-foreground' : 'font-medium text-foreground'
                    )}>
                        {senderLabel}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
                {message.subject && (
                    <p className={cn(
                        'truncate text-xs mt-0.5',
                        !isRead ? 'font-semibold text-foreground' : 'text-foreground/80'
                    )}>
                        {message.subject}
                    </p>
                )}
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                    {message.isDeleted ? t('dashboard.chat.messageDeleted') : message.content}
                </p>
            </div>

            <Star className="size-3.5 shrink-0 text-muted-foreground/40 hover:text-yellow-400 mt-1" />
        </button>
    )
}