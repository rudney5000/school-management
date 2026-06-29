import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    List,
    Undo2,
    Redo2,
    Link2,
    Paperclip,
    Smile,
    Image,
    Video,
    Trash2,
    MoreHorizontal,
    Send,
} from 'lucide-react'
import {
    Button,
    Separator
} from '@shared/ui'
import type { Conversation } from '@entities/chat'

interface MessageInputProps {
    messageText: string
    activeConversation: Conversation | null
    activeConversationId: string | null
    onChange: (text: string) => void
    onSend: () => void
}

export function MessageInput({
                                 messageText,
                                 activeConversation,
                                 activeConversationId,
                                 onChange,
                                 onSend
}: MessageInputProps) {
    return (
        <div className="border-t border-border bg-background m-4 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {activeConversation?.name || 'Select a conversation'}
                </span>
            </div>

            <textarea
                className="min-h-[80px] w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                    }
                }}
            />

            <div className="flex items-center gap-1 border-t border-border px-3 py-2">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Undo2 className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Redo2 className="size-3.5" /></Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Bold className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Italic className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Underline className="size-3.5" /></Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><AlignLeft className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><List className="size-3.5" /></Button>
            </div>

            <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Paperclip className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Link2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Smile className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Image className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Video className="size-3.5" /></Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Trash2 className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><MoreHorizontal className="size-3.5" /></Button>
                    <Button
                        size="sm"
                        className="gap-1.5 rounded-full bg-primary px-4 text-primary-foreground"
                        onClick={onSend}
                        disabled={!messageText.trim() || !activeConversationId}
                    >
                        <Send className="size-3.5" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}