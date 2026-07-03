import {
    FileText,
    Download,
    ExternalLink
} from 'lucide-react'
import { Button } from '@shared/ui'
import { cn } from '@shared/lib'
import type { MessageAttachment } from '@entities/chat'

interface AttachmentViewProps {
    attachment: MessageAttachment
    isOwn: boolean
}

export function AttachmentView({ attachment, isOwn }: AttachmentViewProps) {
    const isImage = attachment.mimeType.startsWith('image/')
    const sizeLabel = attachment.size < 1024 * 1024
        ? `${(attachment.size / 1024).toFixed(1)} KB`
        : `${(attachment.size / 1024 / 1024).toFixed(1)} MB`

    if (isImage) {
        return (
            <div className="mt-2 relative group">
                <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="max-w-[280px] max-h-[200px] rounded-lg object-cover cursor-pointer"
                    onClick={() => window.open(attachment.url, '_blank')}
                    style={{
                        width:  attachment.width  ? Math.min(attachment.width, 280)  : undefined,
                        height: attachment.height ? Math.min(attachment.height, 200) : undefined,
                    }}
                />
                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ExternalLink className="size-5 text-white" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            'mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 max-w-[280px]',
            isOwn ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border bg-muted/50'
        )}>
            <div className="flex size-8 items-center justify-center rounded bg-primary/10 shrink-0">
                <FileText className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{attachment.filename}</p>
                <p className="text-[10px] text-muted-foreground">{sizeLabel}</p>
            </div>
            <Button
                variant="ghost" size="icon-sm"
                className="shrink-0 text-muted-foreground"
                onClick={() => window.open(attachment.url, '_blank')}
            >
                <Download className="size-3.5" />
            </Button>
        </div>
    )
}