import { MessageBubble } from './MessageBubble'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    ScrollArea
} from '@shared/ui'
import type {
    Conversation,
    Message 
} from '@entities/chat'

interface MessageListProps {
    activeConversation: Conversation | null
    messages: Message[]
    currentUserId: string | null
    isLoading: boolean
}

export function MessageList({
                                activeConversation,
                                messages,
                                currentUserId,
                                isLoading
}: MessageListProps) {
    return (
        <ScrollArea className="flex-1">
            {activeConversation && (
                <div className="px-7 py-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar size="lg">
                                {activeConversation.avatar
                                    ? <AvatarImage src={activeConversation.avatar} alt={activeConversation.name || 'Chat'} />
                                    : null
                                }
                                <AvatarFallback className="bg-violet-200 text-violet-700 font-semibold">
                                    {activeConversation.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-primary">{activeConversation.name || 'Unnamed Chat'}</p>
                                <p className="text-sm text-muted-foreground">{activeConversation.description}</p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(activeConversation.updatedAt).toLocaleDateString()}</p>
                            <p>{new Date(activeConversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading && (
                            <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
                        )}
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-sm text-muted-foreground">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                        {[...messages].reverse().map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={message.senderId === currentUserId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </ScrollArea>
    )
}