import { useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    Button,
    Spinner
} from '@shared/ui'
import { cn } from '@shared/lib'
import {Send} from "lucide-react";
import {useThreadReplies} from "@entities/chat/lib/useThreadReplies";

interface InboxThreadRepliesProps {
    threadId: string
    conversationId: string
    currentUserId: string | null
}

export function InboxThreadReplies({
                                       threadId,
                                       conversationId,
                                       currentUserId
}: InboxThreadRepliesProps) {
    const { replies, isLoading, replyToThread } = useThreadReplies(conversationId, threadId)
    const [replyText, setReplyText] = useState('')

    if (isLoading) {
        return (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner />
                Loading replies...
            </div>
        )
    }

    if (replies.length === 0) {
        return <div className="mt-3 text-xs text-muted-foreground">No replies yet</div>
    }

    return (
        <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
            {replies.map((reply) => {
                const isOwn = reply.senderId === currentUserId
                const label = reply.sender.email?.split('@')[0] ?? '??'

                return (
                    <div key={reply.id} className="flex items-start gap-2">
                        <Avatar size="sm">
                            <AvatarFallback className={cn(
                                'text-xs',
                                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                                {label.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">{label}</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                                {reply.content}
                            </p>
                        </div>
                    </div>
                )
            })}
            <div className="flex items-center gap-2 mt-2">
                <input
                    className="flex-1 text-xs bg-muted rounded-full px-3 py-1.5 focus:outline-none"
                    placeholder="Reply in thread..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            replyToThread({content: replyText, type: 'text'})
                            setReplyText('')
                        }
                    }}
                />
                <Button
                    size="icon-sm"
                    className="rounded-full"
                    onClick={() => {
                        replyToThread({content: replyText, type: 'text'})
                        setReplyText('')
                    }}
                    disabled={!replyText.trim()}
                >
                    <Send className="size-3.5"/>
                </Button>
            </div>
        </div>
    )
}