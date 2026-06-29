import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge
} from '@shared/ui'
import { cn } from '@shared/lib'
import type {
    Conversation,
    Message
} from '@entities/chat'

interface ConversationItemProps {
    conversation: Conversation
    isActive: boolean
    isOnline: boolean
    unread: number
    lastMessage?: Message
    onClick: () => void
}

export function ConversationItem({
                                     conversation,
                                     isActive,
                                     isOnline,
                                     unread,
                                     lastMessage,
                                     onClick
}: ConversationItemProps) {
    const initials = conversation.name
        ? conversation.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??'

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-start gap-3 rounded-xl p-3 text-left transition-colors w-full',
                isActive ? 'bg-accent' : 'hover:bg-muted/60'
            )}
        >
            <div className="relative mt-0.5 shrink-0">
                <Avatar>
                    {conversation.avatar
                        ? <AvatarImage src={conversation.avatar} alt={conversation.name || 'Chat'} />
                        : null
                    }
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                {isOnline && (
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-sm font-semibold text-foreground">
                        {conversation.name || 'Unnamed Chat'}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-medium text-foreground/80">
                    {conversation.description || 'No description'}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {lastMessage?.content || 'No messages yet'}
                </p>
            </div>

            {unread > 0 && (
                <Badge className="ml-auto shrink-0 rounded-full text-[10px] px-1.5 py-0.5">
                    {unread}
                </Badge>
            )}
        </button>
    )
}