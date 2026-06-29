import {
    ChevronLeft,
    ChevronRight,
    Download,
    Reply,
    MoreHorizontal,
    Trash2 } from 'lucide-react'
import { Button } from '@shared/ui'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import type {
    Conversation,
    Message
} from '@entities/chat'

interface ChatWindowProps {
    activeConversation: Conversation | null
    activeConversationId: string | null
    messages: Message[]
    currentUserId: string | null
    isLoadingMessages: boolean
    messageText: string
    onMessageChange: (text: string) => void
    onSend: () => void
}

export function ChatWindow({
                               activeConversation,
                               activeConversationId,
                               messages,
                               currentUserId,
                               isLoadingMessages,
                               messageText,
                               onMessageChange,
                               onSend
}: ChatWindowProps) {
    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Download className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Trash2 className="size-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="px-1 text-sm text-muted-foreground">{messages.length} messages</span>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <ChevronRight className="size-4" />
                    </Button>
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