import {
    X,
    FileText
} from 'lucide-react'
import { Button } from '@shared/ui'

interface FilePreviewProps {
    file: File
    onRemove: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : null
    const sizeLabel = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / 1024 / 1024).toFixed(1)} MB`

    return (
        <div className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
            {isImage && previewUrl ? (
                <img
                    src={previewUrl}
                    alt={file.name}
                    className="size-10 rounded object-cover shrink-0"
                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
            ) : (
                <div className="flex size-10 items-center justify-center rounded bg-primary/10 shrink-0">
                    <FileText className="size-5 text-primary" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{sizeLabel}</p>
            </div>
            <Button
                variant="ghost" size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
            >
                <X className="size-3.5" />
            </Button>
        </div>
    )
}