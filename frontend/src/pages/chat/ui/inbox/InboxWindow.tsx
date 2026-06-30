import { useState } from 'react'
import { ScrollArea } from '@shared/ui'
import type {
    Conversation,
    Message
} from '@entities/chat'
import {InboxToolbar} from "@/pages/chat/ui/inbox/InboxToolbar";
import {InboxMessageRow} from "@/pages/chat/ui/inbox/InboxMessageRow";
import {InboxMessageView} from "@/pages/chat/ui/inbox/InboxMessageView";

interface InboxWindowProps {
    activeConversation: Conversation | null
    messages: Message[]
    currentUserId: string | null
    isLoadingMessages: boolean
}

export function InboxWindow({
                                activeConversation,
                                messages,
                                currentUserId,
                                isLoadingMessages
}: InboxWindowProps) {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [replyOpen, setReplyOpen] = useState(false)

    const rootMessages = messages.filter(m => !m.threadId)

    if (!activeConversation) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                Select a conversation
            </div>
        )
    }

    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex w-80 shrink-0 flex-col border-r border-border">
                <InboxToolbar
                    conversation={activeConversation}
                    selectedMessage={selectedMessage}
                    currentUserId={currentUserId}
                />
                <ScrollArea className="flex-1">
                    <div className="flex flex-col divide-y divide-border">
                        {isLoadingMessages && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        )}
                        {rootMessages.length === 0 && !isLoadingMessages && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No messages yet
                            </div>
                        )}
                        {rootMessages.map((message) => (
                            <InboxMessageRow
                                key={message.id}
                                message={message}
                                isSelected={selectedMessage?.id === message.id}
                                currentUserId={currentUserId}
                                onClick={() => {
                                    setSelectedMessage(message)
                                    setReplyOpen(false)
                                }}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                {selectedMessage ? (
                    <InboxMessageView
                        message={selectedMessage}
                        conversation={activeConversation}
                        currentUserId={currentUserId}
                        replyOpen={replyOpen}
                        onReplyOpen={() => setReplyOpen(true)}
                        onReplyClose={() => setReplyOpen(false)}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                        Select a message to read
                    </div>
                )}
            </div>
        </div>
    )
}