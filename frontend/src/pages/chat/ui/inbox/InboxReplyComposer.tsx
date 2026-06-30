import { useState } from 'react'
import {
    Send,
    X,
    Paperclip,
    Smile
} from 'lucide-react'
import { Button } from '@shared/ui'
import type { Conversation, Message } from '@entities/chat'
import {useThreadReplies} from "@entities/chat/lib/useThreadReplies";

interface InboxReplyComposerProps {
    message: Message
    conversation: Conversation
    onClose: () => void
}

export function InboxReplyComposer({ message, conversation, onClose }: InboxReplyComposerProps) {
    const [content, setContent] = useState('')
    const { replyToThread } = useThreadReplies(conversation.id, message.id)

    const handleSend = async () => {
        if (!content.trim()) return
        await replyToThread({ content, type: 'text' })
        setContent('')
        onClose()
    }

    // const recipients = conversation.members
    //     .filter(m => m.userId !== message.senderId)
    //     .map(m => m.user.email?.split('@')[0])
    //     .join(', ')


    return (
        <div className="border-t border-border bg-background m-4 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="text-xs text-muted-foreground shrink-0">To:</span>
                <div className="flex flex-wrap gap-1 flex-1">
                    {conversation.members
                        .filter(m => m.userId !== message.senderId)
                        .slice(0, 3)
                        .map(m => (
                            <span
                                key={m.id}
                                className="bg-muted text-xs px-2 py-0.5 rounded-full text-foreground"
                            >
                                {m.user.email?.split('@')[0]}
                            </span>
                        ))
                    }
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <button className="hover:text-foreground">Cc</button>
                    <button className="hover:text-foreground">Bcc</button>
                </div>
                <Button
                    variant="ghost" size="icon-sm"
                    className="text-muted-foreground"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <span className="text-xs text-muted-foreground shrink-0">Re:</span>
                <span className="text-xs text-foreground truncate">
                    {message.subject || message.content?.slice(0, 50)}
                </span>
            </div>

            <textarea
                className="min-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none"
                placeholder="Type your reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                        handleSend()
                    }
                }}
                autoFocus
            />

            <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Paperclip className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Smile className="size-3.5" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost" size="sm"
                        className="text-muted-foreground"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5 rounded-full px-4"
                        onClick={handleSend}
                        disabled={!content.trim()}
                    >
                        <Send className="size-3.5" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}