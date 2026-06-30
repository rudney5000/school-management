import {
    Reply,
    MoreHorizontal
} from 'lucide-react'
import { Button } from '@shared/ui'
import { MessageList } from '../MessageList'
import { MessageInput } from '../MessageInput'
import type {
    Conversation,
    Message
} from '@entities/chat'

interface DmWindowProps {
    activeConversation: Conversation
    activeConversationId: string | null
    messages: Message[]
    currentUserId: string | null
    isLoadingMessages: boolean
    messageText: string
    onMessageChange: (text: string) => void
    onSend: () => void
}

export function DmWindow({
                             activeConversation,
                             activeConversationId,
                             messages,
                             currentUserId,
                             isLoadingMessages,
                             messageText,
                             onMessageChange,
                             onSend
}: DmWindowProps) {
    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">
                        {activeConversation.name || 'Direct Message'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Reply className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </div>
            </div>

            <MessageList
                activeConversation={activeConversation}
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoadingMessages}
            />

            <MessageInput
                messageText={messageText}
                activeConversation={activeConversation}
                activeConversationId={activeConversationId}
                onChange={onMessageChange}
                onSend={onSend}
            />
        </div>
    )
}