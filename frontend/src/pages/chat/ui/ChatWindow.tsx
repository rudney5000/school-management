import { DmWindow } from './dm/DmWindow'
import { InboxWindow } from './inbox/InboxWindow'
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
                               onSend,
                           }: ChatWindowProps) {
    if (!activeConversation) {
        return (
            <div className="flex flex-1 items-center justify-center bg-card">
                <p className="text-sm text-muted-foreground">Select a conversation</p>
            </div>
        )
    }

    if (activeConversation.type === 'dm') {
        return (
            <DmWindow
                activeConversation={activeConversation}
                activeConversationId={activeConversationId}
                messages={messages}
                currentUserId={currentUserId}
                isLoadingMessages={isLoadingMessages}
                messageText={messageText}
                onMessageChange={onMessageChange}
                onSend={onSend}
            />
        )
    }

    return (
        <InboxWindow
            activeConversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoadingMessages={isLoadingMessages}
        />
    )
}