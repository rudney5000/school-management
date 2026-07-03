import {
    Avatar,
    AvatarFallback
} from '@shared/ui'
import { cn } from '@shared/lib'
import type { Message } from '@entities/chat'
import {AttachmentView} from "@/pages/chat/ui/AttachmentView";

interface MessageBubbleProps {
    message: Message
    isOwn: boolean
}

export function MessageBubble({
                                  message,
                                  isOwn
}: MessageBubbleProps) {

    const senderEmail = message.sender?.email ?? 'Utilisateur inconnu'
    const initials =
        senderEmail.split('@')[0].slice(0, 2).toUpperCase()

    return (
        <div className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
            <Avatar size="sm">
                <AvatarFallback className={cn(
                    'text-xs font-semibold',
                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className={cn(
                'max-w-[70%] rounded-lg px-4 py-2 text-sm',
                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            )}>
                <p className="font-semibold text-xs mb-1">
                    {senderEmail}
                </p>
                {message.isDeleted
                    ? <p className="italic opacity-60">Message supprimé</p>
                    : message.content
                        ? <p>{message.content}</p>
                        : null
                }

                {message.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                        {message.attachments.map((attachment) => (
                            <AttachmentView
                                key={attachment.id}
                                attachment={attachment}
                                isOwn={isOwn}
                            />
                        ))}
                    </div>
                )}

                {message.isEdited && !message.isDeleted && (
                    <p className="text-[9px] opacity-50 mt-0.5">modifié</p>
                )}
                <p className="text-[10px] opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
    )
}