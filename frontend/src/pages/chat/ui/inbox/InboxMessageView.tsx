import { useState } from 'react'
import {
    Reply,
    Forward,
    Star,
    Archive,
    MoreHorizontal,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    Button,
    ScrollArea,
    Separator
} from '@shared/ui'
import type {
    Conversation,
    Message
} from '@entities/chat'
import {cn} from "@shared/lib";
import {useMessageActions} from "@entities/chat/lib/useMessageActions";
import {InboxThreadReplies} from "@/pages/chat/ui/inbox/InboxThreadReplies";
import {InboxReplyComposer} from "@/pages/chat/ui/inbox/InboxReplyComposer";
import {ForwardDialog} from "@/pages/chat/ui/inbox/ForwardDialog";

interface InboxMessageViewProps {
    message: Message
    conversation: Conversation
    currentUserId: string | null
    replyOpen: boolean
    onReplyOpen: () => void
    onReplyClose: () => void
}

export function InboxMessageView({
                                     message,
                                     conversation,
                                     currentUserId,
                                     replyOpen,
                                     onReplyOpen,
                                     onReplyClose
}: InboxMessageViewProps) {
    const [threadOpen, setThreadOpen] = useState(false)
    const senderLabel = message.sender.email?.split('@')[0] ?? '??'
    const initials = senderLabel.slice(0, 2).toUpperCase()
    const { starMessage, forwardMessage } = useMessageActions(conversation.id)
    const [forwardOpen, setForwardOpen] = useState(false)

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={onReplyOpen}
                    >
                        <Reply className="size-3.5" />
                        Reply
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => setForwardOpen(true)}
                    >
                        <Forward className="size-3.5" />
                        Forward
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon-sm"
                        className={cn('text-muted-foreground', message.isStarred && 'text-yellow-400')}
                        onClick={() => starMessage(message)}
                    >
                        <Star className={cn('size-4', message.isStarred && 'fill-yellow-400')} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Archive className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-full">
                <div className="px-6 py-5">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <Avatar size="lg">
                                <AvatarFallback className="bg-violet-200 text-violet-700 font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{senderLabel}</p>
                                <p className="text-xs text-muted-foreground">{message.sender.email}</p>
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                    <span>To:</span>
                                    {conversation.members
                                        .filter(m => m.userId !== message.senderId)
                                        .slice(0, 3)
                                        .map(m => (
                                            <span key={m.id} className="bg-muted rounded px-1.5 py-0.5">
                                                {m.user.email?.split('@')[0]}
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            <p>{new Date(message.createdAt).toLocaleDateString()}</p>
                            <p>{new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                            })}</p>
                        </div>
                    </div>

                    {message.subject && (
                        <h2 className="text-lg font-bold text-foreground mb-4">
                            {message.subject}
                        </h2>
                    )}

                    <Separator className="mb-5" />

                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {message.isDeleted
                            ? <span className="italic text-muted-foreground">Message supprimé</span>
                            : message.content
                        }
                    </div>

                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setThreadOpen(p => !p)
                            }}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                            {threadOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            {threadOpen ? 'Hide replies' : 'Show replies'}
                        </Button>

                        {threadOpen && (
                            <InboxThreadReplies
                                threadId={message.id}
                                conversationId={conversation.id}
                                currentUserId={currentUserId}
                            />
                        )}
                    </div>
                </div>
            </ScrollArea>

            {replyOpen && (
                <InboxReplyComposer
                    message={message}
                    conversation={conversation}
                    onClose={onReplyClose}
                />
            )}

            {forwardOpen && (
                <ForwardDialog
                    message={message}
                    onForward={(targetId) => {
                        forwardMessage(message, targetId)
                        setForwardOpen(false)
                    }}
                    onClose={() => setForwardOpen(false)}
                />
            )}
        </div>
    )
}