import {
    Search,
    SlidersHorizontal,
    Plus
} from 'lucide-react'
import {
    Button,
    Input,
    ScrollArea,
    Spinner
} from '@shared/ui'
import { ConversationItem } from './ConversationItem'
import type {
    Conversation,
    Message
} from '@entities/chat'

interface ConversationListProps {
    conversations: Conversation[]
    activeConversationId: string | null
    onlineUsers: string[]
    unreadByConv: Record<string, number>
    messages: Message[]
    isLoading: boolean
    onSelect: (id: string) => void
}

export function ConversationList({
                                     conversations,
                                     activeConversationId,
                                     onlineUsers,
                                     unreadByConv,
                                     messages,
                                     isLoading,
                                     onSelect
}: ConversationListProps) {
    return (
        <div className="flex w-80 shrink-0 flex-col border-r border-border bg-background">
            <div className="flex items-center gap-2 p-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="rounded-full pl-9 text-sm bg-card border-border"
                    />
                </div>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <SlidersHorizontal className="size-4" />
                </Button>
                <Button size="icon-sm" className="rounded-full bg-primary text-primary-foreground">
                    <Plus className="size-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-2">
                    {conversations.map((conversation) => {
                        const lastMessage = messages.find(m => m.conversationId === conversation.id)
                        const isOnline = conversation.members.some(m => onlineUsers.includes(m.userId))
                        const unread = unreadByConv[conversation.id] ?? 0

                        return (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isActive={activeConversationId === conversation.id}
                                isOnline={isOnline}
                                unread={unread}
                                lastMessage={lastMessage}
                                onClick={() => onSelect(conversation.id)}
                            />
                        )
                    })}
                    {isLoading && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            <Spinner/>
                            Loading conversations...
                        </div>
                    )}
                    {conversations.length === 0 && !isLoading && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No conversations yet
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}