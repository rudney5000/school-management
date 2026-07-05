import {
    Reply,
    MoreHorizontal
} from 'lucide-react'
import { Button } from '@shared/ui'
import { MessageList } from '../MessageList'
import { MessageInput } from '../MessageInput'
import type {
    Conversation,
    Message, UploadedFile
} from '@entities/chat'
import {
    getConversationDisplayName
} from "@entities/chat/lib/getConversationDisplayName";

interface DmWindowProps {
    activeConversation: Conversation
    activeConversationId: string | null
    messages: Message[]
    currentUserId: string | null
    isLoadingMessages: boolean
    messageText: string
    onMessageChange: (text: string) => void
    onSend: (attachments?: UploadedFile[]) => void
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
        <div className="flex flex-1 flex-col bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">
                        {getConversationDisplayName(activeConversation, currentUserId)}
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

            <div className="flex-1 overflow-hidden min-h-0">
                <MessageList
                    activeConversation={activeConversation}
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoadingMessages}
                />
            </div>

            <MessageInput
                messageText={messageText}
                activeConversation={activeConversation}
                activeConversationId={activeConversationId}
                currentUserId={currentUserId}
                onChange={onMessageChange}
                onSend={onSend}
            />
        </div>
    )
}