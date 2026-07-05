import { useState } from 'react'
import { ScrollArea } from '@shared/ui'
import type {
    Conversation,
    Message, UploadedFile
} from '@entities/chat'
import {InboxToolbar} from "@/pages/chat/ui/inbox/InboxToolbar";
import {InboxMessageRow} from "@/pages/chat/ui/inbox/InboxMessageRow";
import {InboxMessageView} from "@/pages/chat/ui/inbox/InboxMessageView";
import {MessageInput} from "@/pages/chat/ui/MessageInput";
import { useTranslation } from '@shared/lib'

interface InboxWindowProps {
    activeConversation: Conversation | null
    activeConversationId: string | null
    messages: Message[]
    currentUserId: string | null
    isLoadingMessages: boolean
    messageText: string
    onMessageChange: (text: string) => void
    onSend: (attachments?: UploadedFile[]) => void
}

export function InboxWindow({
                                activeConversation,
                                activeConversationId,
                                messages,
                                currentUserId,
                                isLoadingMessages,
                                messageText,
                                onMessageChange,
                                onSend
}: InboxWindowProps) {
    const { t } = useTranslation()
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [replyOpen, setReplyOpen] = useState(false)

    const rootMessages = messages.filter(m => !m.threadId)

    if (!activeConversation) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                {t('dashboard.chat.selectConversation')}
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
                                {t('dashboard.chat.loadingMessages')}
                            </div>
                        )}
                        {rootMessages.length === 0 && !isLoadingMessages && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                {t('dashboard.chat.noMessages')}
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

            <div className="flex flex-1 flex-col min-h-0">
                <div className="flex-1 overflow-hidden min-h-0">
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
                            {t('dashboard.chat.selectConversation')}
                        </div>
                    )}
                </div>
                <MessageInput
                    messageText={messageText}
                    activeConversation={activeConversation}
                    activeConversationId={activeConversationId}
                    onChange={onMessageChange}
                    onSend={onSend}
                    currentUserId={currentUserId}
                />
            </div>
        </div>
    )
}