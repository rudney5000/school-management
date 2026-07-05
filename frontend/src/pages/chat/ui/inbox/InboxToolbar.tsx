import {
    Archive,
    Star,
    Trash2
} from 'lucide-react'
import { Button } from '@shared/ui'
import type {
    Conversation,
    Message
} from '@entities/chat'
import {useMessageActions} from "@entities/chat/lib/useMessageActions";
import {cn} from "@shared/lib";
import { useTranslation } from '@shared/lib'

interface InboxToolbarProps {
    conversation: Conversation
    selectedMessage: Message | null
    currentUserId: string | null
}

export function InboxToolbar({
                                 conversation,
                                 selectedMessage
}: InboxToolbarProps) {
    const { t } = useTranslation()
    const {
        starMessage,
        archiveMessage,
        deleteMessage,
        loadingId
    } = useMessageActions(conversation.id)

    return (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex flex-col">
                <span className="text-sm font-semibold">{conversation.name}</span>
                <span className="text-xs text-muted-foreground">
                    {conversation.members.length}
                    {t('dashboard.chat.members')}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost" size="icon-sm"
                    className={cn(
                        'text-muted-foreground',
                        selectedMessage?.isStarred && 'text-yellow-400'
                    )}
                    disabled={!selectedMessage || loadingId === selectedMessage.id}
                    onClick={() => selectedMessage && starMessage(selectedMessage)}
                >
                    <Star className={cn('size-4', selectedMessage?.isStarred && 'fill-yellow-400')} />
                </Button>
                <Button
                    variant="ghost" size="icon-sm"
                    className="text-muted-foreground"
                    disabled={!selectedMessage || loadingId === selectedMessage.id}
                    onClick={() => selectedMessage && archiveMessage(selectedMessage)}
                >
                    <Archive className="size-4" />
                </Button>
                <Button
                    variant="ghost" size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={!selectedMessage || loadingId === selectedMessage.id}
                    onClick={() => selectedMessage && deleteMessage(selectedMessage)}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    )
}